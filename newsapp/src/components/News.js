import React, { useEffect, useState } from 'react';
import NewsItem from './NewsItem';
import Spinner from './Spinner';
import PropTypes from 'prop-types';
import NoArticle from './NoArticle';
import '../news.css';
import { useLocation } from 'react-router-dom';
import RecentNewsViewed from './RecentNewsViewed';

const News = (props) => {

    // Detect current route
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const api_url = process.env.REACT_APP_API_URL;

    const getDates = () => {
        const date = new Date();

        let full_year = date.getFullYear();
        let curr_date = date.getDate();
        let curr_month = date.getMonth();
        let from_curr_month;

        if (curr_month >= 0 && curr_date !== 1) {
            from_curr_month = curr_month + 1;
        }

        if (curr_month === 0 && curr_date === 1) {
            full_year = full_year - 1;
            curr_date = 31;
            from_curr_month = 12;
        }
        else if (curr_month === 1 && curr_date === 1) {
            curr_date = 28;
            from_curr_month = 1;
        }
        else if (curr_month === 2 && curr_date === 1) {
            curr_date = 28;
            from_curr_month = 2;
        }
        else if (curr_month === 3 && curr_date === 1) {
            curr_date = 28;
            from_curr_month = 3;
        }
        else if (curr_month === 4 && curr_date === 1) {
            curr_date = 28;
            from_curr_month = 4;
        }
        else if (curr_month === 5 && curr_date === 1) {
            curr_date = 28;
            from_curr_month = 5;
        }
        else if (curr_month === 6 && curr_date === 1) {
            curr_date = 28;
            from_curr_month = 6;
        }
        else if (curr_month === 7 && curr_date === 1) {
            curr_date = 28;
            from_curr_month = 7;
        }
        else if (curr_month === 8 && curr_date === 1) {
            curr_date = 28;
            from_curr_month = 8;
        }
        else if (curr_month === 9 && curr_date === 1) {
            curr_date = 28;
            from_curr_month = 9;
        }
        else if (curr_month === 10 && curr_date === 1) {
            curr_date = 28;
            from_curr_month = 10;
        }
        else if (curr_month === 11 && curr_date === 1) {
            curr_date = 28;
            from_curr_month = 11;
        }

        return {
            full_year,
            from_curr_month,
            curr_date,
            curr_month
        };
    };

    const updateNews = async () => {

        props.updateProgress(10);

        console.log('Search text 3 = ', props.query);

        const {
            full_year,
            from_curr_month,
            curr_month,
            curr_date
        } = getDates();

        props.updateDropDownTitle(
            props.category.charAt(0).toUpperCase() +
            props.category.slice(1)
        );

        let searchQuery =
            typeof props.query === 'string' && props.query.trim() !== ''
                ? `&q=${props.query.split(' ').join('+')}`
                : '';

        let url = `${process.env.REACT_APP_API_URL}/api/v1/news?country=${props.country}${searchQuery}&category=${props.category}&pageSize=20&page=${page}&from=${full_year}-${from_curr_month}-${curr_date - 1}&to=${full_year}-${curr_month + 1}-${curr_date}`;

        setLoading(true);
        props.updateProgress(30);

        try {

            const data = await fetch(url);

            props.updateProgress(50);

            const parsedData = await data.json();

            props.updateProgress(70);

            setArticles(parsedData.articles || []);
            setTotalResults(parsedData.totalResults || 0);

        } catch (error) {

            console.error("Error fetching news:", error);

        } finally {

            setLoading(false);
            props.updateProgress(100);

        }
    };

    useEffect(() => {
        updateNews();
    }, [page, props.query, props.category]);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [articles]);

    const handlepreviousclick = () => {
        setPage(page - 1);
    };

    const handlenextclick = () => {
        setPage(page + 1);
    };

    return (

        <div className='news-container my-3 mx-2'>

            <h2 className="mx-4 title" style={{ marginTop: '70px' }}>
                {props.title}
            </h2>

            <h5 className='mx-5'>
                {props.query && props.query !== '[object Object]'
                    ? `Searching for ${props.query}`
                    : ''}
            </h5>

            {loading ? <Spinner /> : null}

            {/* MAIN HOME/CATEGORY LAYOUT */}

            <div className={isHomePage ? "home-news-layout" : ""}>

                {/* LEFT SIDE: NEWS ARTICLES */}

                <div className="news-main-content">

                    <div className="row">

                        {articles && articles.length > 0 ? (

                            <>

                                {/* NEWS CARDS */}

                                {articles.map((element) => {

                                    let Title = element.title === null
                                        ? "No Title"
                                        : element.title;

                                    let Description = element.description === null
                                        ? "No Description"
                                        : element.description;

                                    return (

                                        <div
                                            className="news-card-column"
                                            key={element.url}
                                        >

                                            <NewsItem
                                                backendurl={props.backendurl}
                                                title={Title}
                                                description={Description}
                                                imageUrl={element.urlToImage}
                                                newsUrl={element.url}
                                                author={element.author}
                                                date={element.publishedAt}
                                                source={element.source?.name}
                                                category={props.category}
                                            />

                                        </div>

                                    );

                                })}

                                {/* PAGINATION */}

                                <div className="container d-flex justify-content-between my-3">

                                    <button
                                        disabled={page <= 1}
                                        type="button"
                                        className="btn btn-info"
                                        onClick={handlepreviousclick}
                                    >
                                        &larr; Previous
                                    </button>

                                    <span
                                        className="badge bg-primary text-light px-2 py-2"
                                        style={{
                                            height: "27px",
                                            position: "relative",
                                            top: "18%",
                                        }}
                                    >
                                        Page No:{" "}

                                        {totalResults >= 100
                                            ? `${page}/${Math.ceil(100 / 20)}`
                                            : `${page}/${Math.ceil(totalResults / 20) === 0
                                                ? 1
                                                : Math.ceil(totalResults / 20)}`}
                                    </span>

                                    <button
                                        disabled={
                                            totalResults >= 100
                                                ? page >= Math.ceil(100 / 20)
                                                : page >= Math.ceil(totalResults / 20)
                                        }
                                        type="button"
                                        className="btn btn-info"
                                        onClick={handlenextclick}
                                    >
                                        Next &rarr;
                                    </button>

                                </div>

                            </>

                        ) : (

                            !loading && <NoArticle />

                        )}

                    </div>

                </div>

                {/* RIGHT SIDE: RECENTLY VIEWED NEWS */}

                {isHomePage && (

                    <aside className="recent-news-sidebar">

                        <RecentNewsViewed />

                    </aside>

                )}

            </div>

        </div>
    );

};

News.defaultProps = {
    country: '',
    category: 'general',
    query: '',
};

News.propTypes = {
    country: PropTypes.string,
    category: PropTypes.string,
    title: PropTypes.string,
    query: PropTypes.string,
    updateProgress: PropTypes.func.isRequired,
    updateDropDownTitle: PropTypes.func.isRequired,
    apiKey: PropTypes.string.isRequired,
};

export default News;
