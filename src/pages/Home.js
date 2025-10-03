import React from "react";
import { Card, Row, Col, Typography, Input, Space, Tag, Skeleton, Button } from "antd";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase";
import { addDoc } from "firebase/firestore";

const { Title, Text } = Typography;

export default function Home() {
  const [recent, setRecent] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"), limit(6));
    const unsub = onSnapshot(q, (snap) => {
      setRecent(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const seed = async () => {
    const samples = [
      { name: "후라이드 치킨 2마리", cover: "/chicken.png" },
      { name: "마라탕 4인분 모음", cover: "/ddbbii.png" },
      { name: "수제버거 세트", cover: "/hamburger.png" },
      { name: "피자 라지 2판", cover: "/pizza.png" },
      { name: "족발/보쌈 하프&하프", cover: "/jogbal.png" },
      { name: "보쌈 대왕세트", cover: "/bossam.png" }
    ];
    for (const s of samples) {
      try {
        await addDoc(collection(db, "rooms"), {
          name: s.name,
          cover: s.cover,
          createdBy: "seed@baeyo.app",
          createdAt: new Date()
        });
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div style={{
        background: "linear-gradient(135deg, #ffedd5 0%, #fff7ed 100%)",
        border: "1px solid #ffe4c7",
        borderRadius: 20,
        padding: 28,
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(253,186,116,0.35)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
          <img src="/baeyo.png" alt="BaeYo" height={40} />
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: "#7c2d12", letterSpacing: -0.2 }}>
          같이 시키면 훨씬 싸다!
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "center" }}>
          <Input.Search placeholder="지금 우리 동네 공동구매 찾아보기" style={{ maxWidth: 520 }} size="large" />
          <Button type="primary" size="large" onClick={seed}>샘플 채우기</Button>
        </div>
      </div>

      <Title level={4} className="section-title">방금 올라온 모집 글</Title>
      {loading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Col xs={24} sm={12} md={8} lg={6} key={i}>
              <Card className="glass-card"><Skeleton active /></Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[16, 16]}>
          {recent.map((p) => (
            <Col xs={24} sm={12} md={8} lg={6} key={p.id}>
              <Card title={p.name} className="glass-card" extra={<Tag color="orange">모집중</Tag>}>
                <Text type="secondary">작성자: {p.createdBy}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Title level={4} className="section-title">BaeYo도 같이 먹을래</Title>
      <Row gutter={[16, 16]}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Col xs={24} sm={12} md={8} lg={6} key={i}>
            <Card className="glass-card" title={`스폰서 모집 ${i + 1}`} extra={<Tag color="green">공식</Tag>}>
              <Text type="secondary">BaeYo가 1인분 치를 같이 내드려요</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}


