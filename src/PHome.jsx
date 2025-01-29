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
      timestamp: "January 28, 2025",
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
      timestamp: "January 29, 2025",
    },
  ]);

  const [announcements, setAnnouncements] = useState("No announcements yet.");
  const [editAnnouncement, setEditAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState(announcements);

  const handleEditAnnouncement = () => {
    setEditAnnouncement(true);
  };

  const handleSaveAnnouncement = () => {
    setAnnouncements(announcementText);
    setEditAnnouncement(false);
  };

  const [expandedPost, setExpandedPost] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyBoxVisibility, setReplyBoxVisibility] = useState({});
  const [upvotedPosts, setUpvotedPosts] = useState(new Set());

  const handleLike = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: upvotedPosts.has(postId) ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
    setUpvotedPosts((prev) =>
      upvotedPosts.has(postId)
        ? new Set([...prev].filter((id) => id !== postId))
        : new Set([...prev, postId])
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
    setReplyText("");
    setReplyBoxVisibility((prevState) => ({
      ...prevState,
      [`${postId}-${commentId}`]: false,
    }));
  };

  const toggleReplyBox = (postId, commentId) => {
    setReplyBoxVisibility((prevState) => ({
      ...prevState,
      [`${postId}-${commentId}`]: !prevState[`${postId}-${commentId}`],
    }));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 flex">
      <div className="w-3/4">
        <h2 className="text-2xl font-semibold mb-4">Classroom Stream</h2>
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="text-gray-500 text-sm mb-1">
              Posted on {post.timestamp}
            </div>
            <h3 className="text-lg font-bold">{post.title}</h3>
            <p className="text-gray-700 mt-2">{post.content}</p>
            <div className="flex items-center mt-3 space-x-4">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center ${
                  upvotedPosts.has(post.id)
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <FaArrowUp className="mr-1" /> {post.likes}
              </button>
              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center text-gray-600 hover:text-blue-600"
              >
                <FaComment className="mr-1" /> {post.comments.length} Comments
              </button>
            </div>
            {expandedPost === post.id && (
              <div className="mt-4 border-t pt-3">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="mb-2">
                    <p className="text-gray-800">{comment.text}</p>
                    {comment.replies.length > 0 && (
                      <div className="ml-4 mt-2">
                        {comment.replies.map((reply, index) => (
                          <p key={index} className="text-gray-600">
                            Reply: {reply}
                          </p>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => toggleReplyBox(post.id, comment.id)}
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      Reply
                    </button>
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
                          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
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
      <div className="w-1/4 ml-6 p-4 bg-white rounded-lg shadow-xl">
        <h3 className="text-lg font-bold mb-2">Announcements</h3>
        {editAnnouncement ? (
          <div>
            <textarea
              className="w-full p-2 border rounded-2xl"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
            />
            <button
              onClick={handleSaveAnnouncement}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        ) : (
          <div>
            <p>{announcements}</p>
            <button
              onClick={handleEditAnnouncement}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
