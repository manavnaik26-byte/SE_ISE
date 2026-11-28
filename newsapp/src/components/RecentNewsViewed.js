
import React, { useContext, useEffect, useState } from 'react';
import profileContext from '../context/Profile/profileContext';
import '../recentnews.css';

const RecentNewsViewed = () => {

    const { user } = useContext(profileContext);

    const [recentNews, setRecentNews] = useState([]);

    // Fetch recent history from localStorage
    const fetchHistory = () => {

        if (!user?._id) {
            setRecentNews([]);
            return;
        }

        const historyKey = `history_${user._id}`;

        try {
            const storedHistory = JSON.parse(
                localStorage.getItem(historyKey) || '[]'
            );

            setRecentNews(
                Array.isArray(storedHistory)
                    ? storedHistory.slice(0, 5)
                    : []
            );

        } catch (error) {
            console.error('Error loading reading history:', error);
            setRecentNews([]);
        }
    };

    useEffect(() => {

        // Load history initially
        fetchHistory();

        // Update when an article is viewed in this tab
        window.addEventListener('historyUpdated', fetchHistory);

        // Update when localStorage changes in another tab
        window.addEventListener('storage', fetchHistory);

        return () => {
            window.removeEventListener('historyUpdated', fetchHistory);
            window.removeEventListener('storage', fetchHistory);
        };

    }, [user?._id]);

    return (
       

    <div className="recent-news-container">

        <h4 className="recent-news-title">
            Recently Viewed
        </h4>

        {recentNews.length === 0 ? (

            <p className="no-recent-news">
                No recently viewed articles.
            </p>

        ) : (

            <div className="recent-news-list">

                {recentNews.slice(0, 5).map((article, index) => (

                    <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        className="recent-news-item"
                        key={article.url || index}
                    >

                        <img
                            src={article.image || '/assets/images/logo.png'}
                            alt="News"
                            onError={(e) => {
                                e.target.src = '/assets/images/logo.png';
                            }}
                        />

                        <div className="recent-news-details">

                            <h6>
                                {article.title || 'No Title'}
                            </h6>

                            <small>
                                {article.date
                                    ? new Date(article.date).toLocaleDateString()
                                    : ''}
                            </small>

                        </div>

                    </a>

                ))}

            </div>

        )}

    </div>


    );
};

export default RecentNewsViewed;