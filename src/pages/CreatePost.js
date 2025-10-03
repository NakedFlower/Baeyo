import React, { useState } from "react";
import { Form, Input, Button, DatePicker, InputNumber, message, Space, Typography } from "antd";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, subscribeAuth } from "../firebase";

const { Title } = Typography;

export default function CreatePost() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    const unsub = subscribeAuth(setCurrentUser);
    return () => unsub && unsub();
  }, []);

  const onFinish = async (values) => {
    if (!currentUser) {
      message.error("로그인이 필요합니다");
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "rooms"), {
        name: values.title,
        price: values.price || null,
        deadline: values.deadline ? values.deadline.toDate() : null,
        description: values.description || "",
        createdBy: currentUser.email,
        createdAt: serverTimestamp()
      });
      message.success("모집글이 등록되었습니다");
      form.resetFields();
    } catch (e) {
      message.error("등록 중 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Title level={3} className="section-title">모집글 올리기</Title>
      <Form form={form} layout="vertical" onFinish={onFinish} className="glass-card">
        <Form.Item name="title" label="제목" rules={[{ required: true, message: "제목을 입력하세요" }]}>
          <Input placeholder="예: 치킨 공동구매 모집" />
        </Form.Item>
        <Form.Item name="price" label="예상 단가">
          <InputNumber prefix="₩" min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="deadline" label="마감 시간">
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="description" label="설명">
          <Input.TextArea rows={4} placeholder="상세 정보, 참여 조건 등을 적어주세요" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            등록하기
          </Button>
        </Form.Item>
      </Form>
    </Space>
  );
}


