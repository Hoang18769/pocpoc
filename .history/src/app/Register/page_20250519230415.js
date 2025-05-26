{mode === "forgot" && (
  <form onSubmit={handleSubmit} className="space-y-6">
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">Enter your email</h4>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground"
        required
      />
    </div>
    <Button type="submit" className="w-full font-medium py-3 rounded-md">
      Send reset link
    </Button>
  </form>
)}
