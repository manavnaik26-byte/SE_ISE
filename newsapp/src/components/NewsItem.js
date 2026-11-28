
import React, { useContext, useEffect, useState } from 'react';
import bookmarkContext from '../context/Bookmark/bookmarkContext';
import profileContext from '../context/Profile/profileContext';
import '../newsitem.css';

const NewsItem = (props) => {

    const {
        title,
        description,
        imageUrl,
        newsUrl,
        author,
        date,
        source,
        category,
        backendurl
    } = props;

    const { user, getUser } = useContext(profileContext);

    const {
        bookmarks,
        removeBookmark,
        addBookmark
    } = useContext(bookmarkContext);

    const [bookmarkChecked, setBookmarkChecked] = useState(false);

    // Limit title and description length
    const Title = title
        ? title.length >= 45
            ? title.slice(0, 45) + '...'
            : title
        : 'No Title';

    const Description = description
        ? description.length >= 88
            ? description.slice(0, 88) + '...'
            : description
        : 'No Description';

    const Author = author
        ? author.length >= 50
            ? author.slice(0, 50) + '...'
            : author
        : 'Unknown';

    const Source = source
        ? source.length >= 20
            ? source.slice(0, 20) + '...'
            : source
        : 'Unknown Source';

    const defaultImage = '/assets/images/logo.png';

    const validImageUrl = imageUrl || defaultImage;

    // ==========================================
    // SAVE RECENTLY VIEWED NEWS
    // ==========================================

    const saveToHistory = async (e) => {

    e.preventDefault();

    console.log("1. READ MORE CLICKED");
    console.log("2. ARTICLE URL:", newsUrl);
    console.log("3. CURRENT USER:", user?._id);

    if (!user?._id) {
        console.error("User not logged in. History not saved.");
        window.open(newsUrl, '_blank', 'noopener,noreferrer');
        return;
    }

    const historyKey = `history_${user._id}`;

    let existing = [];

    try {
        existing = JSON.parse(
            localStorage.getItem(historyKey) || '[]'
        );

        if (!Array.isArray(existing)) existing = [];

    } catch (error) {
        console.error("Error reading history:", error);
    }

    console.log("4. OLD HISTORY COUNT:", existing.length);

    const alreadyRead = existing.some(
        article => article.url === newsUrl
    );

    console.log("5. ALREADY READ:", alreadyRead);

    const item = {
        title: title || 'No Title',
        url: newsUrl,
        image: imageUrl || '/assets/images/logo.png',
        date: new Date().toISOString()
    };

    const filtered = existing.filter(
        article => article.url !== newsUrl
    );

    filtered.unshift(item);

    const recentArticles = filtered.slice(0, 5);

    try {

        localStorage.setItem(
            historyKey,
            JSON.stringify(recentArticles)
        );

        console.log("6. NEW HISTORY:", recentArticles);
        console.log("7. TOTAL ARTICLES:", recentArticles.length);

        window.dispatchEvent(new Event('historyUpdated'));

    } catch (error) {
        console.error("Error saving history:", error);
    }

    window.open(newsUrl, '_blank', 'noopener,noreferrer');

    try {
        if (!alreadyRead) {
            await inc_art_read();
        }

        await categoryfav();
        await updateStreak();

    } catch (error) {
        console.error("Error updating user statistics:", error);
    }
};


        console.log("READ MORE CLICKED");
        console.log("CURRENT USER:", user);
        console.log("ARTICLE URL:", newsUrl);

    // ==========================================
    // INCREMENT ARTICLE READ COUNT
    // ==========================================

    const inc_art_read = async () => {

        await fetch(
            `${backendurl}/api/v1/user/addArticleReadCount`,
            {
                method: 'PUT',
                headers: {
                    'auth-token': localStorage.getItem('token')
                }
            }
        );
    };

    // ==========================================
    // UPDATE FAVORITE CATEGORY
    // ==========================================

    const categoryfav = async () => {

        const safeCategory = category || 'General';

        await fetch(
            `${backendurl}/api/v1/user/read-article`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    category: safeCategory
                })
            }
        );

        console.log('CATEGORY SENT:', safeCategory);
    };

    // ==========================================
    // UPDATE READING STREAK
    // ==========================================

    const updateStreak = async () => {

        await fetch(
            `${backendurl}/api/v1/user/update-streak`,
            {
                method: 'PUT',
                headers: {
                    'auth-token': localStorage.getItem('token')
                }
            }
        );

        await getUser();
    };

    // ==========================================
    // CHECK BOOKMARK STATUS
    // ==========================================

    useEffect(() => {

        const isBookmarked = bookmarks.some(
            bookmark => bookmark.newsUrl === newsUrl
        );

        setBookmarkChecked(isBookmarked);

    }, [bookmarks, newsUrl]);

    // ==========================================
    // ADD / REMOVE BOOKMARK
    // ==========================================

    const postBookmark = () => {

        if (bookmarkChecked) {

            const bookmark = bookmarks.find(
                item => item.newsUrl === newsUrl
            );

            if (bookmark) {
                removeBookmark(bookmark._id);
            }

            setBookmarkChecked(false);

        } else {

            addBookmark({
                title,
                description,
                imageUrl,
                newsUrl,
                author: Author,
                date,
                source
            });

            setBookmarkChecked(true);
        }
    };

    // ==========================================
    // SHARE NEWS
    // ==========================================

    const shareNews = (title, text, url) => {

        if (navigator.share) {

            navigator.share({
                title: title,
                text: text,
                url: url
            })
            .catch(() => {
                alert('Failed to share.');
            });

        } else {

            alert('Sharing is not supported on this browser.');

        }
    };

    // ==========================================
    // RENDER NEWS CARD
    // ==========================================

    return (

        <div className="newsitem-container my-2 mx-32 shadow-lg">

            <div className="card" style={{ height: '100%' }}>

                <div className="image-wrapper">

                    <img
                        src={validImageUrl}
                        className="card-img-top"
                        alt="News"
                        height="200px"
                        onError={(e) => {
                            e.target.src = defaultImage;
                        }}
                    />

                </div>

                <div className="card-body">

                    <h5 className="card-title">
                        {Title}
                    </h5>

                    <span className="badge text-bg-secondary">
                        {Source}
                    </span>

                    <p className="card-text">
                        {Description}
                    </p>

                    <p className="card-text">

                        <small className="text-body-secondary">
                            By {Author} on {
                                date
                                    ? new Date(date).toUTCString()
                                    : 'Unknown Date'
                            }
                        </small>

                    </p>

                    <div className="bottom">

                        <a
                            rel="noreferrer"
                            onClick={saveToHistory}
                            href={newsUrl}
                            target="_blank"
                            className="btn btn-outline-primary"
                        >
                            Read More
                        </a>

                        <div className="twobtns">

                            <button
                                className="btn btn-outline-secondary mx-2"
                                onClick={() => shareNews(
                                    title,
                                    description,
                                    newsUrl
                                )}
                            >
                                <i className="bi bi-share"></i>
                            </button>

                            <button
                                className="btn btn-outline-secondary mx-2 float-end"
                                onClick={postBookmark}
                            >
                                {
                                    bookmarkChecked
                                        ? <i className="bi bi-bookmark-check"></i>
                                        : <i className="bi bi-bookmark"></i>
                                }
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default NewsItem;
