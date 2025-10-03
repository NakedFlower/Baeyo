import React from "react";
import { FloatButton, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Listings from "./Listings";
import CreatePost from "./CreatePost";

export default function GroupBuy() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Listings />
      <FloatButton
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setOpen(true)}
        style={{ right: 24, bottom: 24 }}
      />
      <Modal open={open} onCancel={() => setOpen(false)} footer={null} title="모집글 작성">
        <CreatePost />
      </Modal>
    </>
  );
}


