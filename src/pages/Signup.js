import React, { useState } from "react";
import { Form, Input, Button, Typography, Space, message } from "antd";
import { signupWithEmail } from "../firebase";

const { Title } = Typography;

export default function Signup() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await signupWithEmail(values.email, values.password);
      message.success("회원가입 완료");
    } catch (e) {
      message.error("회원가입 실패: 이미 존재하거나 형식 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%", maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>
      <Title level={3} className="section-title">회원가입</Title>
      <Form layout="vertical" onFinish={onFinish} className="glass-card" style={{ padding: 16 }}>
        <Form.Item name="email" label="이메일" rules={[{ required: true }, { type: 'email' }]}>
          <Input placeholder="you@example.com" />
        </Form.Item>
        <Form.Item name="password" label="비밀번호" rules={[{ required: true, min: 6, message: '6자 이상' }]}>
          <Input.Password placeholder="비밀번호" />
        </Form.Item>
        <Form.Item name="password2" label="비밀번호 확인" dependencies={["password"]} rules={[({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('password') === value) return Promise.resolve();
            return Promise.reject(new Error('비밀번호가 일치하지 않습니다'));
          }
        })]}>
          <Input.Password placeholder="비밀번호 확인" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>가입하기</Button>
        </Form.Item>
      </Form>
    </Space>
  );
}


