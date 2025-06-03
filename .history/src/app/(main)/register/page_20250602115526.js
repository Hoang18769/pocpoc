<form onSubmit={handleSubmit} className="space-y-6">
  {/* Email */}
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

  {/* Register mode extra fields */}
  {mode === "register" && (
    <>
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Given Name</h4>
        <input
          type="text"
          value={givenName}
          onChange={(e) => setGivenName(e.target.value)}
          className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground"
          required
        />
      </div>
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Family Name</h4>
        <input
          type="text"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground"
          required
        />
      </div>
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Birthdate</h4>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground"
          required
        />
      </div>
    </>
  )}

  {/* Password - Ẩn khi mode = forgot */}
  {mode !== "forgot" && (
    <div className="space-y-2 relative">
      <h4 className="text-sm font-medium text-muted-foreground">Password</h4>
      <input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground pr-8"
        required={mode !== "forgot"}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-0 top-6 text-muted-foreground hover:text-foreground"
        tabIndex={-1}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )}

  {/* Confirm password for register */}
  {mode === "register" && (
    <div className="space-y-2 relative">
      <h4 className="text-sm font-medium text-muted-foreground">Confirm Password</h4>
      <input
        type={showPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full bg-transparent border-b border-input px-0 py-1 focus:outline-none focus:border-primary text-foreground pr-8"
        required
      />
    </div>
  )}

  {/* Button Submit nằm giữa */}
  <div className="flex justify-center">
    <Button type="submit" disabled={loading} className="w-full max-w-xs">
      {loading
        ? mode === "register"
          ? "Registering..."
          : mode === "forgot"
          ? "Sending..."
          : "Logging in..."
        : mode === "register"
        ? "Register"
        : mode === "forgot"
        ? "Send Reset Link"
        : "Sign in"}
    </Button>
  </div>

  {/* Link chuyển mode */}
  <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
    {mode === "login" && (
      <>
        <div>
          Don’t have an account?{" "}
          <button
            onClick={() => setMode("register")}
            className="text-blue-500 dark:text-blue-400 hover:underline"
          >
            Register
          </button>
        </div>
        <div>
          or{" "}
          <button
            onClick={() => setMode("forgot")}
            className="text-blue-500 dark:text-blue-400 hover:underline"
          >
            Forgot password?
          </button>
        </div>
      </>
    )}

    {mode === "register" && (
      <div>
        Already have an account?{" "}
        <button
          onClick={() => setMode("login")}
          className="text-blue-500 dark:text-blue-400 hover:underline"
        >
          Sign in
        </button>
      </div>
    )}

    {mode === "forgot" && (
      <div>
        Remembered?{" "}
        <button
          onClick={() => setMode("login")}
          className="text-blue-500 dark:text-blue-400 hover:underline"
        >
          Back to Sign in
        </button>
      </div>
    )}
  </div>
</form>
