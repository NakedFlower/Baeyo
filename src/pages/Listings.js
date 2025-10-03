import React, { useEffect, useMemo, useState } from "react";
import { Card, Input, Tag, Row, Col, Empty, Space, Typography, Skeleton, Image } from "antd";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const { Title, Text } = Typography;

export default function Listings() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qText, setQText] = useState("");

  useEffect(() => {
    const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const next = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPosts(next);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const t = qText.trim().toLowerCase();
    if (!t) return posts;
    return posts.filter((p) => (p.name || "").toLowerCase().includes(t));
  }, [qText, posts]);

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Title level={3} className="section-title">현재 모집글</Title>
      <Input.Search placeholder="검색: 제목, 키워드" allowClear onChange={(e) => setQText(e.target.value)} />

      {loading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Col xs={24} sm={12} md={8} lg={6} key={i}>
              <Card className="glass-card"><Skeleton active /></Card>
            </Col>
          ))}
        </Row>
      ) : filtered.length === 0 ? (
        <Empty description={<Text type="secondary">모집글이 없습니다</Text>} />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((p) => (
            <Col xs={24} sm={12} md={8} lg={6} key={p.id}>
              <Card
                className="glass-card"
                cover={p.cover ? <img alt={p.name} src={p.cover} style={{ height: 160, objectFit: 'cover' }} /> : null}
                title={p.name}
                extra={<Tag color="green">모집중</Tag>}
              >
                <Space direction="vertical" size={8}>
                  <Text type="secondary">작성자: {p.createdBy}</Text>
                  {/* 확장: 가격, 마감시간, 위치 등 */}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Space>
  );
}


