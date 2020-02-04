import React, { useState } from 'react';
import axios from 'axios';

export default props => {
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <form>
      <p>
        <label>Handle:</label>
        <input type="text" onChange={e => setHandle(e.target.value)} />
      </p>
      <p>
        <label>Name:</label>
        <input type="text" onChange={e => setName(e.target.value)} />
      </p>
      <p>
        <label>Email:</label>
        <input type="text" onChange={e => setEmail(e.target.value)} />
      </p>
      <input type="submit" />
    </form>
  )
}