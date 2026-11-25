import NavBar from "./NavBar.jsx";

const Header = ({ salvia }) => {
  if (salvia) return <header className="salvia-header"><NavBar salvia /></header>;

  const SpacerStyle = {
    paddingBottom: "72px",
  };

  return (
    <>
      <section className="fixed-top">
        <NavBar />
      </section>

      <section style={SpacerStyle} />
    </>
  );
};

export default Header;