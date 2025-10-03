import React, { useState, useEffect } from "react";
import { auth, login, logout, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);

  // 로그인 상태 추적
  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // 방 불러오기 (실시간 업데이트)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "rooms"), (snapshot) => {
      setRooms(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  // 방 만들기
  const createRoom = async () => {
    const roomName = prompt("방 이름을 입력하세요");
    if (roomName) {
      await addDoc(collection(db, "rooms"), {
        name: roomName,
        createdBy: user.email,
        createdAt: new Date()
      });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🍔 배달 공동구매</h1>
      {user ? (
        <>
          <p>환영합니다 {user.displayName}님</p>
          <button onClick={logout}>로그아웃</button>
          <hr />
          <button onClick={createRoom}>방 만들기</button>
          <h2>방 목록</h2>
          <ul>
            {rooms.map((room) => (
              <li key={room.id}>{room.name} (생성자: {room.createdBy})</li>
            ))}
          </ul>
        </>
      ) : (
        <button onClick={login}>구글 로그인</button>
      )}
    </div>
  );
}

export default App;
