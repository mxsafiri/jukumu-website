// Stack Auth handler removed - using custom JWT authentication
export default function Handler() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Authentication</h1>
        <p className="text-gray-600">Please use the login page to access your account.</p>
      </div>
    </div>
  );
}

export function generateMetadata() {
  return {
    title: 'Authentication - Jukumu',
    description: 'Authentication page for Jukumu web portal'
  };
}
