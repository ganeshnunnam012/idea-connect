import { useState } from "react";
import { updateIdea } from "@/lib/db";

export default function EditIdeaModal({ idea, closeModal }) {
  const [title, setTitle] = useState(idea.title);
  const [description, setDescription] = useState(idea.description);

  const handleUpdate = async () => {
    await updateIdea(idea.id, { title, description });
    closeModal(); // close modal after update
  };

  return (
    <div className="modal">
      <h2>Edit Idea</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      <button onClick={handleUpdate}>Save</button>
      <button onClick={closeModal}>Cancel</button>
    </div>
  );
}