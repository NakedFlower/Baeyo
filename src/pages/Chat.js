import React from "react";
import { List, Avatar, Typography, Empty } from "antd";

const { Title, Text } = Typography;

export default function Chat() {
  const rooms = [];
  return (
    <div>
      <Title level={3} className="section-title">채팅방</Title>
      {rooms.length === 0 ? (
        <Empty description={<Text type="secondary">아직 채팅방이 없습니다</Text>} />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={rooms}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta avatar={<Avatar>{item.name[0]}</Avatar>} title={item.name} description={item.lastMessage} />
            </List.Item>
          )}
        />
      )}
    </div>
  );
}


