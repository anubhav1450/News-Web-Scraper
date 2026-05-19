import "./Home.css";

import {
  useContext,
  useEffect,
  useState,
} from "react";

import { AuthContext } from "../context/AuthContext";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL;

function Home() {

  const { user, logout } =
    useContext(AuthContext);

  const [stories, setStories] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [sortType, setSortType] =
    useState("points");

  const navigate = useNavigate();

  const handleLogout = () => {

    logout();

    navigate("/login");
  };

  const fetchStories = async () => {

    try {

      const response = await axios.get(
        `${API_URL}/api/stories?sort=${sortType}`
      );

      setStories(response.data || []);

    } catch (error) {

      console.log(error);

    }
  };

  const handleRefresh = async () => {

    try {

      setLoading(true);

      await axios.post(
        `${API_URL}/api/stories/scrape`
      );

      setTimeout(() => {

        fetchStories();

      }, 1500);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  const handleBookmark = async (
    storyId
  ) => {

    const token =
      localStorage.getItem("token");

    if (!token) {

      navigate("/login");

      return;
    }

    setStories((prevStories) =>
      prevStories.map((story) => {

        if (story._id === storyId) {

          const alreadyBookmarked =
            story.bookmarks?.includes(
              user?.id
            );

          return {
            ...story,

            bookmarks:
              alreadyBookmarked
                ? story.bookmarks.filter(
                    (id) =>
                      id !== user?.id
                  )
                : [
                    ...story.bookmarks,
                    user?.id,
                  ],
          };
        }

        return story;
      })
    );

    try {

      await axios.post(
        `${API_URL}/api/stories/${storyId}/bookmark`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    } catch (error) {

      console.log(error);

      fetchStories();

    }
  };

  useEffect(() => {

    fetchStories();

  }, [sortType]);

  return (
    <div className="home-container">

      <nav className="navbar">

        <div className="logo">
          Hacker News
        </div>

        <div className="nav-right">

          {
            user ? (
              <>

                <Link
                  to="/bookmarks"
                  className="bookmark-nav-link"
                >
                  Bookmarks
                </Link>

                <span className="user-name">
                  Welcome, {user?.name}
                </span>

                <button
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>

              </>
            ) : (
              <>

                <Link
                  to="/login"
                  className="bookmark-nav-link"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bookmark-nav-link"
                >
                  Register
                </Link>

              </>
            )
          }

        </div>

      </nav>

      <div className="home-content">

        <div className="top-bar">

          <h1>
            Top Stories
          </h1>

          <select
            className="sort-dropdown"
            value={sortType}
            onChange={(e) =>
              setSortType(
                e.target.value
              )
            }
          >

            <option value="points">
              Highest Points
            </option>

            <option value="latest">
              Latest Stories
            </option>

          </select>

          <button
            className="refresh-button"
            onClick={handleRefresh}
          >
            {
              loading
                ? "Refreshing..."
                : "Refresh Stories"
            }
          </button>

        </div>

        <div className="stories-container">

          {
            stories?.map((story) => (

              <div
                className="story-card"
                key={story._id}
              >

                <a
                  href={story.url}
                  target="_blank"
                  rel="noreferrer"
                  className="story-title"
                >
                  {story.title}
                </a>

                <p>
                  Author: {story.author}
                </p>

                <p>
                  Points: {story.points}
                </p>

                <p>
                  Posted: {story.postedAt}
                </p>

                <button
                  className={
                    story.bookmarks?.includes(
                      user?.id
                    )
                      ? "bookmark-button active-bookmark"
                      : "bookmark-button"
                  }
                  onClick={() =>
                    handleBookmark(
                      story._id
                    )
                  }
                >
                  {
                    story.bookmarks?.includes(
                      user?.id
                    )
                      ? "Bookmarked ✓"
                      : "Bookmark +"
                  }
                </button>

              </div>
            ))
          }

        </div>

      </div>

    </div>
  );
}

export default Home;