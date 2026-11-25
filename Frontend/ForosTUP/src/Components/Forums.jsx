import ForumDisplay from "./ForumDisplay.jsx";

export default function Forums({ forumsProp, onDelete }) {
  return (
    <ul className="salvia-forum-grid">
      {forumsProp.map((forum) => <ForumDisplay key={forum.id} forum={forum} onDelete={onDelete} />)}
    </ul>
  );
}
