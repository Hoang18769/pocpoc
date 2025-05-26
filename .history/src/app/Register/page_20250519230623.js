<form onSubmit={handleSubmit} className="space-y-6">
  <div className="space-y-2">
    <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground"
      required
    />
  </div>

  <div className="space-y-2">
    <h4 className="text-sm font-medium text-muted-foreground">Password</h4>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-transparent border-b border-input px-0 pr-10 py-1 focus:outline-none focus:border-primary text-foreground"
        required
      />
      <button
        type="button"
        className="absolute right-0 top-1/2 -translate-y-1/2"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Eye className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
    </div>
  </div>

  {mode === "register" && (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">Confirm Password</h4>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground"
        required
      />
    </div>
  )}

  <Button type="submit" className="w-full font-medium py-3 rounded-md">
    {mode === "login" ? "Sign in" : "Register"}
  </Button>

  {mode === "login" && (
    <div className="text-right text-sm">
      <button
        type="button"
        onClick={() => setMode("forgot")}
        className="text-blue-500 dark:text-blue-400 hover:underline"
      >
        Forgot password?
      </button>
    </div>
  )}
</form>
