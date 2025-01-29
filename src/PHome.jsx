import React, { useState } from "react";
import { FaArrowUp, FaComment } from "react-icons/fa";

const Home = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "First Post",
      content: "This is an example post content.",
      likes: 10,
      comments: [
        { id: 1, text: "Great post!", replies: [] },
        { id: 2, text: "Very informative!", replies: [] },
      ],
    },
    {
      id: 2,
      title: "Second Post",
      content: "Another interesting post here!",
      likes: 5,
      comments: [
        { id: 1, text: "Nice one!", replies: [] },
        { id: 2, text: "I learned something new.", replies: [] },
      ],
    },
  ]);

  const [expandedPost, setExpandedPost] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyBoxVisibility, setReplyBoxVisibility] = useState({});
  const [upvotedPosts, setUpvotedPosts] = useState(new Set()); // Track upvoted posts
  const [searchText, setSearchText] = useState(""); // State for search query

  const handleLike = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: upvotedPosts.has(postId)
                ? post.likes - 1 // If already upvoted, decrease the likes
                : post.likes + 1, // Otherwise, increase the likes
            }
          : post
      )
    );
    setUpvotedPosts(
      (prev) =>
        upvotedPosts.has(postId)
          ? new Set([...prev].filter((id) => id !== postId)) // Remove from upvoted set if already upvoted
          : new Set([...prev, postId]) // Add to upvoted set if not already upvoted
    );
  };

  const toggleComments = (postId) => {
    setExpandedPost((prev) => (prev === postId ? null : postId));
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  const addReply = (postId, commentId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      replies: [...comment.replies, replyText],
                    }
                  : comment
              ),
            }
          : post
      )
    );
    setReplyText(""); // Clear reply text after adding
    setReplyBoxVisibility((prevState) => ({
      ...prevState,
      [`${postId}-${commentId}`]: false, // Hide reply box after sending
    }));
  };

  const toggleReplyBox = (postId, commentId) => {
    setReplyBoxVisibility((prevState) => ({
      ...prevState,
      [`${postId}-${commentId}`]: !prevState[`${postId}-${commentId}`], // Toggle reply box visibility
    }));
  };

  // Filter posts based on the search query
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchText.toLowerCase()) ||
      post.content.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="flex-1 max-w-2xl mx-auto p-6">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded-lg w-full"
        />
      </div>

      {/* Render filtered posts */}
      {filteredPosts.map((post) => (
        <div key={post.id} className="bg-white p-4 rounded-lg shadow-xl mb-4">
          <h3 className="text-lg font-bold">{post.title}</h3>
          <p className="text-gray-700 mt-2">{post.content}</p>
          <div className="flex items-center mt-3 space-x-4">
            <button
              onClick={() => handleLike(post.id)}
              className={`flex items-center ${
                upvotedPosts.has(post.id)
                  ? "text-lime-700" // If upvoted, turn the button green
                  : "text-gray-600 hover:text-lime-700"
              }`}
            >
              <FaArrowUp className="mr-1" /> {post.likes}
            </button>
            <button
              onClick={() => toggleComments(post.id)}
              className="flex items-center text-gray-600 hover:text-lime-700"
            >
              <FaComment className="mr-1" /> {post.comments.length} Comments
            </button>
          </div>

          {/* Show comments if expandedPost matches this post's id */}
          {expandedPost === post.id && (
            <div className="mt-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="mb-4">
                  <p className="text-gray-800">{comment.text}</p>

                  {/* Show replies */}
                  {comment.replies.length > 0 && (
                    <div className="ml-4 mt-2">
                      {comment.replies.map((reply, index) => (
                        <p
                          key={index}
                          className="text-gray-600"
                        >{`Reply: ${reply}`}</p>
                      ))}
                    </div>
                  )}

                  {/* Reply Button */}
                  <button
                    onClick={() => toggleReplyBox(post.id, comment.id)}
                    className="mt-2 text-lime-600 hover:text-lime-800"
                  >
                    Reply
                  </button>

                  {/* Conditionally display reply form */}
                  {replyBoxVisibility[`${post.id}-${comment.id}`] && (
                    <div className="mt-2 flex">
                      <input
                        type="text"
                        value={replyText}
                        onChange={handleReplyChange}
                        className="border p-2 rounded-lg flex-1"
                        placeholder="Type a reply..."
                      />
                      <button
                        onClick={() => addReply(post.id, comment.id)}
                        className="ml-2 px-4 py-2 bg-lime-600 text-white rounded-lg"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Home;
