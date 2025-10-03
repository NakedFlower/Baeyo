import React, { useState } from "react";
import { Form, Input, Button, Typography, Space, message } from "antd";
import { resetPassword } from "../firebase";

const { Title } = Typography;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ email }) => {
    setLoading(true);
    try {
      await resetPassword(email);
      message.success("비밀번호 재설정 메일을 보냈습니다");
    } catch (e) {
      message.error("발송 실패: 이메일을 확인해주세요");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Title level={3} className="section-title">비밀번호 찾기</Title>
      <Form layout="vertical" onFinish={onFinish} className="glass-card">
        <Form.Item name="email" label="이메일" rules={[{ required: true }, { type: 'email' }]}>
          <Input placeholder="you@example.com" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>메일 보내기</Button>
        </Form.Item>
      </Form>
    </Space>
  );
}


