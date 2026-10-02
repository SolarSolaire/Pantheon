export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <input type="email" placeholder="Email" style={{ padding: '8px', margin: '5px 0' }} />
        </div>
        <div>
          <input type="password" placeholder="Password" style={{ padding: '8px', margin: '5px 0' }} />
        </div>
        <button type="submit" style={{ padding: '8px 16px', marginTop: '10px' }}>Sign In</button>
      </form>
    </div>
  );
}