import { AnimatePresence, motion } from "framer-motion";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const formVariants = {
    enter: {
        x: 220,
        opacity: 0,
    },
    center: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.55,
            ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
        },
    },
    exit: {
        x: -220,
        opacity: 0,
        transition: {
            duration: 0.45,
            ease: [0.55, 0.06, 0.68, 0.19], // easeInQuart
        },
    },
};

export default function AuthCard({ mode, onSwitchToSignup, onSwitchToLogin, successMessage }) {
    return (
        <div className="login-right">
            {/* overflow:hidden clip container so sliding forms don't overflow */}
            <div className="auth-card-clip">
                <AnimatePresence mode="wait" initial={false}>
                    {mode === "login" ? (
                        <motion.div
                            key="login"
                            variants={formVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            style={{ width: "100%", display: "flex", justifyContent: "center" }}
                        >
                            <LoginForm
                                onSwitchToSignup={onSwitchToSignup}
                                successMessage={successMessage}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="signup"
                            variants={formVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            style={{ width: "100%", display: "flex", justifyContent: "center" }}
                        >
                            <SignupForm onSwitchToLogin={onSwitchToLogin} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
