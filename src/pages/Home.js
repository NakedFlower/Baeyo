import React from "react";
import { Card, Row, Col, Typography, Input, Carousel, Space, Tag, Skeleton } from "antd";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase";

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

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div style={{ textAlign: "center" }}>
        <img src="/baeyo.png" alt="BaeYo" height={36} />
        <Title level={2} style={{ marginTop: 8 }}>가기 시키면 덷 쌌다!</Title>
        <Input.Search placeholder="지금 우리 동네 공동구매 찾아보기" style={{ maxWidth: 520 }} />
      </div>

      <Carousel autoplay dots>
        {["치킨/피자", "중식/튀김", "커피/디저트"].map((c, i) => (
          <div key={i}>
            <div style={{ height: 120, background: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12 }}>
              <Title level={4} style={{ margin: 0 }}>{c}</Title>
            </div>
          </div>
        ))}
      </Carousel>

      <Title level={4} className="section-title">오늘의 핫딜</Title>
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

      <Title level={4} className="section-title">BaeYo 지원 모집</Title>
      <Row gutter={[16, 16]}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Col xs={24} sm={12} md={8} lg={6} key={i}>
            <Card className="glass-card" title={`스폰서 모집 ${i + 1}`} extra={<Tag color="green">공식</Tag>}>
              <Text type="secondary">수수료 지원, 빠른 매칭</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}


