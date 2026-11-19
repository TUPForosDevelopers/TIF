import { authenticate, getCurrentUser } from "../Services/userService.js";
import { useAuth } from "../context/AuthContext";
import "./LogIn.css";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

const LogIn = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    correo: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = await authenticate(form.correo, form.password);
      const user = await getCurrentUser(token);
      login(user, token);
      navigate(state?.from || "/main", { replace: true });

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

return (
    <main className="login-page login-page-light">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={7} lg={5} xl={4}>
            <Card className="login-card">
              <Card.Body className="login-card-body">
                <div className="login-header">
                  <div className="login-badge">Foro TUP</div>

                  <h2 className="login-title">Iniciar sesión</h2>

                  <p className="login-subtitle">
                    Entrá y participá en el Gran Foro TUP
                  </p>
                </div>

                {error && (
                  <Alert variant="danger" className="login-alert">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="login-label">
                      Correo electrónico
                    </Form.Label>

                    <Form.Control
                      className="login-input"
                      type="email"
                      name="correo"
                      placeholder="ejemplo@mail.com"
                      value={form.correo}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="login-label">
                      Contraseña
                    </Form.Label>

                    <Form.Control
                      className="login-input"
                      type="password"
                      name="password"
                      placeholder="Ingresá tu contraseña"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="login-button"
                    disabled={loading}
                  >
                    {loading ? "Ingresando..." : "Iniciar sesión"}
                  </Button>
                </Form>

                <div className="login-footer">
                  <span>¿No tenés cuenta?</span>{" "}
                  <Link to="/register">Registrate</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default LogIn;