<div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6">
  {/* Avatar */}
  <img
    src="/avatar-placeholder.png"
    alt="Avatar"
    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover"
  />

  {/* Info */}
  <div className="flex-1">
    {/* Tên và nút */}
    <div className="flex items-center gap-3 flex-wrap">
      <h2 className="text-xl font-semibold">Name</h2>
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
        Add Friend
      </button>
    </div>

    {/* Username */}
    <p className="text-gray-500 text-sm">@amanxux</p>

    {/* Stats */}
    <div className="flex gap-4 mt-1 text-sm">
      <span><strong>225</strong> Posts</span>
      <span><strong>225</strong> Friends</span>
    </div>

    {/* Bio */}
    <p className="text-sm mt-2 text-gray-700">Bio</p>

    {/* Link */}
    <a
      href="https://linktr.ee/amanxux"
      target="_blank"
      className="text-blue-500 text-sm hover:underline block mt-1"
    >
      linktr.ee/amanxux
    </a>

    {/* Edit profile */}
    <button className="mt-2 px-4 py-1 border rounded-full text-sm text-gray-600 hover:bg-gray-100">
      Edit Profile
    </button>
  </div>
</div>

{/* Tabs */}
<div className="flex justify-around text-sm border-t mt-4 pt-2">
  <button className="flex items-center gap-1 text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v2H3zM3 9h18v2H3zM3 15h18v2H3zM3 21h18v2H3z"/></svg>
    POSTS
  </button>
  <button className="flex items-center gap-1 text-gray-500 hover:text-black">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 15V4"/></svg>
    Photos
  </button>
  <button className="flex items-center gap-1 text-gray-400 cursor-not-allowed">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    SAVED
  </button>
</div>
