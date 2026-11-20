import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ForumListPage from "./ForumListPage.jsx";

export default function MainPage() {
  const { user } = useAuth();

  return (
    <main>
      <section className="salvia-container salvia-home">
        <div>
          <h1>{user?.name ? `Bienvenido, ${user.name}` : "ForosTUP"}</h1>
          <p>Compartí consultas, ideas y proyectos con la comunidad de la TUP.</p>
          <Link className="btn salvia-primary" to="/foros">Explorar foros</Link>
        </div>
        <span className="salvia-mark" aria-hidden="true" />
      </section>
      <ForumListPage embedded />
    </main>
  );
}
