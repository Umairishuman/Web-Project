import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Landing } from "./pages/Landing";
import { About } from "./pages/About";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Page403 } from "./pages/Page403";
import { Page404 } from "./pages/Page404";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { UserManagement } from "./pages/admin/UserManagement";
import { ClassManagement } from "./pages/ClassManagement";
import { ClassPage } from "./pages/ClassPage";
import { QuizCreate } from "./pages/QuizCreate";
import { QuizEdit } from "./pages/QuizEdit";
import { QuizAttempt } from "./pages/QuizAttempt";
import { QuizResults } from "./pages/QuizResults";
import { Results } from "./pages/Results";
import { MyResults } from "./pages/MyResults";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";

function App() {
    return (
        <Router>
            <AuthProvider>
                <ToastProvider>
                    <div className="min-h-screen flex flex-col bg-surface">
                        <Navbar />
                        <main className="flex-1">
                            <Routes>
                                <Route path="/" element={<Landing />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />
                                <Route path="/403" element={<Page403 />} />
                                <Route path="/404" element={<Page404 />} />

                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/class/:id"
                                    element={
                                        <ProtectedRoute>
                                            <ClassPage />
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/quiz/:id"
                                    element={
                                        <ProtectedRoute allowedRoles={["student"]}>
                                            <QuizAttempt />
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/results"
                                    element={
                                        <ProtectedRoute allowedRoles={["student"]}>
                                            <MyResults />
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/results/:attemptId"
                                    element={
                                        <ProtectedRoute allowedRoles={["student"]}>
                                            <Results />
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute>
                                            <Profile />
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/admin"
                                    element={
                                        <ProtectedRoute allowedRoles={["admin"]}>
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/admin/users"
                                    element={
                                        <ProtectedRoute allowedRoles={["admin"]}>
                                            <UserManagement />
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/classes"
                                    element={
                                        <ProtectedRoute>
                                            <ClassManagement />
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/quiz/create"
                                    element={
                                        <ProtectedRoute allowedRoles={["teacher"]}>
                                            <QuizCreate />
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/quiz/:id/edit"
                                    element={
                                        <ProtectedRoute allowedRoles={["teacher"]}>
                                            <QuizEdit />
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/quiz/:id/results"
                                    element={
                                        <ProtectedRoute allowedRoles={["teacher"]}>
                                            <QuizResults />
                                        </ProtectedRoute>
                                    }
                                />

                                <Route path="*" element={<Navigate to="/404" replace />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </ToastProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
