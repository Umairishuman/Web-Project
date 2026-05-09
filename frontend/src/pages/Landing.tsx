import { Link } from 'react-router-dom';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-darknavy mb-4">ExamGuard</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A full-stack web-based quiz & examination platform for academic institutions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-primary mb-2">For Teachers</h3>
            <p className="text-gray-600">Create classes, schedule quizzes, and grade student submissions with ease.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-primary mb-2">For Students</h3>
            <p className="text-gray-600">Join classes, take quizzes, and view your results and progress.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-primary mb-2">For Admins</h3>
            <p className="text-gray-600">Manage users, monitor platform activity, and ensure system security.</p>
          </div>
        </div>

        <div className="text-center">
          <Link to="/register" className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition text-lg">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};
