"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Post {
  id: number
  title: string
  content: string
  author: string
  date: string
  comments: Comment[]
  likes: number
  isLiked?: boolean
}

interface Comment {
  id: number
  content: string
  author: string
  date: string
}

interface User {
  name: string
  avatar: string
}

// Format date in a client-side component to avoid hydration issues
const ClientDate = ({ dateString }: { dateString: string }) => {
  const [formattedDate, setFormattedDate] = useState("")

  useEffect(() => {
    try {
      const date = new Date(dateString)
      setFormattedDate(date.toLocaleDateString())
    } catch (e) {
      setFormattedDate("Invalid date")
    }
  }, [dateString])

  return <span>{formattedDate}</span>
}

// Avatar component for consistent user avatars
const UserAvatar = ({ name, avatar }: { name: string; avatar?: string }) => {
  return avatar ? (
    <img
      src={avatar}
      alt={`${name}'s avatar`}
      className="w-12 h-12 rounded-full mr-3 object-cover"
    />
  ) : (
    <div className="w-12 h-12 rounded-full mr-3 bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center text-white font-bold">
      {name[0].toUpperCase()}
    </div>
  )
}

// Button component for consistent styling
const PrimaryButton = ({ 
  children, 
  onClick, 
  type = "button", 
  className = "" 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  type?: "button" | "submit" | "reset"; 
  className?: string;
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type={type}
      onClick={onClick}
      className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${className}`}
    >
      {children}
    </motion.button>
  )
}

// Secondary button for less prominent actions
const SecondaryButton = ({ 
  children, 
  onClick, 
  type = "button", 
  className = "" 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  type?: "button" | "submit" | "reset";
  className?: string;
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type={type}
      onClick={onClick}
      className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium transition-all hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 ${className}`}
    >
      {children}
    </motion.button>
  )
}

// Action button for specific actions (like, comment)
const ActionButton = ({ 
  children, 
  onClick, 
  isActive = false,
  className = ""
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  isActive?: boolean;
  className?: string;
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        isActive
          ? "bg-purple-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      } ${className}`}
    >
      {children}
    </motion.button>
  )
}

const PostCard = ({
  post,
  users,
  onCommentSubmit,
  onLike,
  onDelete,
  onUpdate,
}: {
  post: Post
  users: User[]
  onCommentSubmit: (postId: number, comment: string) => void
  onLike: (postId: number) => void
  onDelete: (postId: number) => void
  onUpdate: (postId: number, updatedPost: Post) => void
}) => {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [editing, setEditing] = useState(false)
  const [updatedTitle, setUpdatedTitle] = useState(post.title)
  const [updatedContent, setUpdatedContent] = useState(post.content)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [commentError, setCommentError] = useState("")

  // Reset edit form when cancelling edit mode
  useEffect(() => {
    if (!editing) {
      setUpdatedTitle(post.title)
      setUpdatedContent(post.content)
    }
  }, [editing, post.title, post.content])

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) {
      setCommentError("Comment cannot be empty")
      return
    }
    setCommentError("")
    onCommentSubmit(post.id, newComment)
    setNewComment("")
  }

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!updatedTitle.trim()) {
      return
    }
    if (!updatedContent.trim()) {
      return
    }
    onUpdate(post.id, {
      ...post,
      title: updatedTitle,
      content: updatedContent,
    })
    setEditing(false)
  }

  const postAuthor = users.find((user) => user.name === post.author) || {
    name: post.author,
    avatar: "",
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6 transition-all duration-300 hover:shadow-lg">
      <div className="p-4 md:p-6">
        {/* Post Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center">
            <UserAvatar name={postAuthor.name} avatar={postAuthor.avatar} />
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {post.author}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <ClientDate dateString={post.date} />
              </p>
            </div>
          </div>
          
          {/* Post Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <ActionButton 
              isActive={post.isLiked}
              onClick={() => onLike(post.id)}
            >
              {post.isLiked ? "Liked" : "Like"} ({post.likes})
            </ActionButton>
            
            <ActionButton onClick={() => setShowComments(!showComments)}>
              {showComments ? "Hide Comments" : "Comments"} ({post.comments.length})
            </ActionButton>
            
            {post.author === "You" && (
              <>
                <ActionButton 
                  className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </ActionButton>
                <ActionButton 
                  className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete
                </ActionButton>
              </>
            )}
          </div>
        </div>

        {/* Edit Form or Post Content */}
        {editing ? (
          <form onSubmit={handleUpdateSubmit} className="space-y-3">
            <div>
              <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Post Title
              </label>
              <input
                id="post-title"
                type="text"
                value={updatedTitle}
                onChange={(e) => setUpdatedTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                placeholder="Post title"
                required
              />
            </div>
            <div>
              <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Post Content
              </label>
              <textarea
                id="post-content"
                value={updatedContent}
                onChange={(e) => setUpdatedContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                rows={4}
                placeholder="Post content"
                required
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="submit">
                Save Changes
              </PrimaryButton>
              <SecondaryButton onClick={() => setEditing(false)}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              {post.title}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
              {post.content}
            </p>
          </>
        )}

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Comments ({post.comments.length})
              </h3>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {post.comments.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 italic">No comments yet. Be the first to comment!</p>
                ) : (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                        {comment.author[0].toUpperCase()}
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 flex-grow">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {comment.author}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            <ClientDate dateString={comment.date} />
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleCommentSubmit} className="mt-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value)
                      if (e.target.value.trim()) {
                        setCommentError("")
                      }
                    }}
                    className="flex-grow p-2 border border-gray-300 rounded-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    placeholder="Add your comment..."
                    aria-label="Comment"
                    aria-describedby={commentError ? "comment-error" : undefined}
                  />
                  <PrimaryButton 
                    type="submit"
                    className="sm:rounded-l-none"
                  >
                    Post
                  </PrimaryButton>
                </div>
                {commentError && (
                  <p id="comment-error" className="mt-1 text-sm text-red-500" role="alert">{commentError}</p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Dialog */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              role="alertdialog"
              aria-labelledby="delete-title"
              aria-describedby="delete-description"
            >
              <p id="delete-title" className="font-semibold text-red-600 dark:text-red-400">Confirm Deletion</p>
              <p id="delete-description" className="text-sm text-red-600 dark:text-red-400 mb-4">
                Are you sure you want to delete this post? This action cannot be
                undone.
              </p>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDelete(post.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const IdeaSharingPlatform = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [postError, setPostError] = useState("")
  const [activeTab, setActiveTab] = useState<"feed" | "create">("feed")
  const [darkMode, setDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser] = useState<User>({
    name: "You",
    avatar: "",
  })

  // Load and initialize data
  useEffect(() => {
    const initialPosts: Post[] = [
      {
        id: 1,
        title: "The Future of AI in Healthcare",
        content:
          "Artificial Intelligence is transforming the healthcare industry in numerous ways. From diagnosing diseases to personalized medicine, AI is making healthcare more efficient and accessible.\n\nAI algorithms can analyze medical images like X-rays and MRIs with remarkable accuracy, often outperforming human radiologists in detecting certain conditions. Additionally, AI-powered predictive analytics can identify patients at risk of developing specific diseases, enabling early intervention.\n\nIn this rapidly evolving field, we're only beginning to scratch the surface of what's possible. The future may bring AI-enhanced surgical robots, personalized treatment plans based on genetic profiles, and virtual health assistants that monitor patients continuously.",
        author: "Dr. Jane Smith",
        date: "2024-03-15T10:30:00Z",
        comments: [
          {
            id: 1,
            content: "This is a game-changer for early disease detection! I've seen how AI tools are already helping identify patterns in medical data that humans might miss.",
            author: "John Doe",
            date: "2024-03-15T11:45:00Z",
          },
          {
            id: 2,
            content: "AI will revolutionize medical research and treatment. The ability to process vast amounts of data quickly could lead to breakthroughs in understanding complex diseases.",
            author: "Sarah Johnson",
            date: "2024-03-15T12:10:00Z",
          },
        ],
        likes: 25,
        isLiked: false,
      },
      {
        id: 2,
        title: "Sustainable Living: Small Changes, Big Impact",
        content:
          "Climate change is one of the most pressing issues of our time. While it may seem daunting, there are many simple changes we can make in our daily lives to reduce our environmental impact.\n\nStart by examining your home energy use. Simple actions like switching to LED bulbs, unplugging electronics when not in use, and adjusting your thermostat can significantly reduce your carbon footprint.\n\nConsider transportation alternatives when possible. Walking, cycling, carpooling, or using public transit not only reduces emissions but often saves money and improves health.\n\nReducing food waste is another impactful change. Plan meals carefully, store food properly, and compost organic waste. Also consider eating more plant-based meals, as meat production is a major contributor to greenhouse gas emissions.",
        author: "Michael Green",
        date: "2024-03-14T14:20:00Z",
        comments: [
          {
            id: 1,
            content: "Great tips! I never thought about the impact of my daily commute. I'm going to start biking to work a few days a week.",
            author: "Emily Chen",
            date: "2024-03-14T15:35:00Z",
          },
        ],
        likes: 18,
        isLiked: false,
      },
      {
        id: 3,
        title: "The Rise of Remote Work: Challenges and Opportunities",
        content: 
          "Remote work has transformed from a rare perk to a mainstream work arrangement. The pandemic accelerated this shift, but many companies are now embracing remote or hybrid models permanently.\n\nThe benefits are clear: greater flexibility, no commute time, potential cost savings, and access to a global talent pool. However, remote work also presents challenges including communication barriers, potential isolation, and blurring of work-life boundaries.\n\nFor organizations to thrive with remote teams, they need to intentionally build culture, establish clear communication channels, and ensure employees have the tools and support they need. For individuals, creating dedicated workspaces, establishing routines, and actively connecting with colleagues becomes essential.",
        author: "Alex Rivera",
        date: "2024-03-10T09:15:00Z",
        comments: [],
        likes: 12,
        isLiked: false,
      }
    ]

    const initialUsers: User[] = [
      { name: "Dr. Jane Smith", avatar: "" },
      { name: "John Doe", avatar: "" },
      { name: "Sarah Johnson", avatar: "" },
      { name: "Michael Green", avatar: "" },
      { name: "Emily Chen", avatar: "" },
      { name: "Alex Rivera", avatar: "" },
      { name: "You", avatar: "" },
    ]

    // Simulate loading data from an API
    setTimeout(() => {
      setPosts(initialPosts)
      setUsers(initialUsers)
      setIsLoading(false)
    }, 1000)

    // Apply dark mode to document
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle("dark", darkMode)
    }
  }, [darkMode])

  // Handle creating a new post
  const handleCreatePost = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostTitle.trim()) {
      setPostError("Please provide a title for your post")
      return
    }
    if (!newPostContent.trim()) {
      setPostError("Please provide content for your post")
      return
    }
    
    setPostError("")
    const newPost: Post = {
      id: Date.now(), // Use timestamp as ID to ensure uniqueness
      title: newPostTitle,
      content: newPostContent,
      author: currentUser.name,
      date: new Date().toISOString(),
      comments: [],
      likes: 0,
      isLiked: false,
    }
    setPosts((prevPosts) => [newPost, ...prevPosts])
    setNewPostTitle("")
    setNewPostContent("")
    setActiveTab("feed")
  }, [newPostTitle, newPostContent, currentUser.name])

  // Handle adding a comment to a post
  const handleCommentSubmit = useCallback((postId: number, comment: string) => {
    if (!comment.trim()) return
    
    setPosts((prevPosts) => prevPosts.map((post) => {
      if (post.id === postId) {
        const newComment: Comment = {
          id: Date.now(), // Use timestamp as ID to ensure uniqueness
          content: comment,
          author: currentUser.name,
          date: new Date().toISOString(),
        }
        return {
          ...post,
          comments: [...post.comments, newComment],
        }
      }
      return post
    }))
  }, [currentUser.name])

  // Handle liking a post
  const handleLike = useCallback((postId: number) => {
    setPosts((prevPosts) => prevPosts.map((post) => {
      if (post.id === postId) {
        const newLikes = post.isLiked ? post.likes - 1 : post.likes + 1
        return {
          ...post,
          likes: newLikes,
          isLiked: !post.isLiked,
        }
      }
      return post
    }))
  }, [])

  // Handle deleting a post
  const handleDelete = useCallback((postId: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
  }, [])

  // Handle updating a post
  const handleUpdate = useCallback((postId: number, updatedPost: Post) => {
    setPosts((prevPosts) => prevPosts.map((post) =>
      post.id === postId ? updatedPost : post
    ))
  }, [])

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev)
  }, [])

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-gray-100"
          : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-900"
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header with title and dark mode toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-900 dark:from-purple-400 dark:to-purple-600">
            Idea Exchange
          </h1>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={darkMode}
                onChange={toggleDarkMode}
                aria-label="Toggle dark mode"
              />
              <div
                className={`w-12 h-6 bg-gray-300 dark:bg-gray-700 rounded-full p-1 transition ${
                  darkMode ? "bg-purple-600" : ""
                }`}
              >
                <div
                  className={`w-4 h-4 ${
                    darkMode ? "bg-white translate-x-6" : "bg-gray-600"
                  } rounded-full shadow-md transform transition-transform`}
                ></div>
              </div>
              <span
                className={`ml-3 text-sm font-medium ${
                  darkMode ? "text-purple-300" : "text-purple-700"
                }`}
              >
                {darkMode ? "Dark Mode" : "Light Mode"}
              </span>
            </label>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex mb-6 border-b border-purple-200 dark:border-purple-800">
          <button
            onClick={() => setActiveTab("feed")}
            className={`py-2 px-6 text-sm font-medium transition-colors relative ${
              activeTab === "feed"
                ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                : "text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
            }`}
            aria-current={activeTab === "feed" ? "page" : undefined}
          >
            Idea Feed
            {activeTab === "feed" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-purple-900 dark:from-purple-400 dark:to-purple-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`py-2 px-6 text-sm font-medium transition-colors relative ${
              activeTab === "create"
                ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                : "text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
            }`}
            aria-current={activeTab === "create" ? "page" : undefined}
          >
            Share an Idea
            {activeTab === "create" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-purple-900 dark:from-purple-400 dark:to-purple-600"
              />
            )}
          </button>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Feed tab content */}
            {activeTab === "feed" && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {posts.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No ideas yet
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Be the first to share your idea with the community!
                    </p>
                    <PrimaryButton onClick={() => setActiveTab("create")}>
                      Share an Idea
                    </PrimaryButton>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      users={users}
                      onCommentSubmit={handleCommentSubmit}
                      onLike={handleLike}
                      onDelete={handleDelete}
                      onUpdate={handleUpdate}
                    />
                  ))
                )}
              </motion.div>
            )}

            {/* Create post tab content */}
            {activeTab === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Share Your Idea
                  </h2>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <div>
                      <label htmlFor="idea-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title
                      </label>
                      <input
                        id="idea-title"
                        type="text"
                        value={newPostTitle}
                        onChange={(e) => {
                          setNewPostTitle(e.target.value)
                          if (e.target.value.trim()) {
                            setPostError("")
                          }
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        placeholder="Give your idea a compelling title..."
                        aria-describedby={postError ? "post-error" : undefined}
                      />
                    </div>
                    <div>
                      <label htmlFor="idea-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        id="idea-content"
                        value={newPostContent}
                        onChange={(e) => {
                          setNewPostContent(e.target.value)
                          if (e.target.value.trim()) {
                            setPostError("")
                          }
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        rows={6}
                        placeholder="Describe your idea in detail. What problem does it solve? Why is it important? How could it be implemented?"
                        aria-describedby={postError ? "post-error" : undefined}
                      />
                    </div>
                    
                    {postError && (
                      <p id="post-error" className="text-sm text-red-500" role="alert">{postError}</p>
                    )}
                    
                    <PrimaryButton
                      type="submit"
                      className="w-full py-3"
                    >
                      Post Idea
                    </PrimaryButton>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Idea Exchange - Connect, Share, Innovate</p>
        </footer>
      </div>
    </div>
  )
}

export default IdeaSharingPlatform