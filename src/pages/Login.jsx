import { auth } from "../firebase/config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function Login() {

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 relative overflow-hidden">

            {/* Background blur shapes */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>

            {/* Login Card */}
            <div className="z-10 backdrop-blur-xl bg-white/15 border border-white/20 rounded-2xl shadow-2xl p-10 w-[90%] max-w-md text-center">

                {/* App Title */}
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome Back 👋
                </h1>

                <p className="text-white/80 mb-8">
                    Sign in to continue your journey
                </p>

                {/* Google Button */}
                <button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
                >
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    Sign in with Google
                </button>

            </div>

            {/* Footer Branding */}
            <div className="absolute bottom-4 text-white/70 text-sm tracking-wide">
                Made by <span className="font-semibold text-white">CodingLagg</span>
            </div>

        </div>
    );
}

export default Login;
