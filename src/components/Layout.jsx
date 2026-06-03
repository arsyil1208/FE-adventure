import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1 bg-light">
        {children}
      </main>
      <footer className="bg-dark text-white text-center py-2 small">
        © 2024 NalaysraAdventure
      </footer>
    </div>
  );
}
