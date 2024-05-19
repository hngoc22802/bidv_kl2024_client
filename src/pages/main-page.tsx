/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, Button, Card, Input } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { getBackEndUrl } from "@/constant";
import StepTransaction from "./step-transaction";
import { useNavigate } from "react-router-dom";
import "./styles.scss";
const MainPage = () => {
  const backEndUrl = getBackEndUrl();

  const [show, setShow] = useState(false);
  const [userInfo, setUserInfo] = useState<any>({});
  const user_id = localStorage.getItem("user_id");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const getData = async (params: any) => {
    const res = await axios.post(
      `${backEndUrl}/api/info/${params.user_id}`,
      params,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setUserInfo(res.data.data);
  };
  useEffect(() => {
    if (user_id) {
      getData({ user_id: user_id });
    }
  }, [user_id]);
  const logout = async () => {
    await axios.post(
      `${backEndUrl}/api/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    localStorage.clear();
    navigate("/login");
  };
  const handelCancel = () => {
    setShow(false);
  };
  return (
    <div className="h-full overflow-hidden bussiness">
      <header className="main">
        <div className="fixed w-full h-[64px] top-0 right-0 bg-white flex justify-between items-center px-[16px]">
          <div className="w-full">
            <Input.Search
              className="max-w-[300px]"
              placeholder="Tìm kiếm bidv"
            ></Input.Search>
          </div>
          <div className="w-full flex justify-center">
            <img src="./public/logo-b.jpg" alt="" />
          </div>
          <div className="w-full flex justify-end gap-2 items-center">
            <div className="text-end">
              <p>Xin chào !</p>
              <p>{userInfo?.partner?.name || "Admin"}</p>
            </div>
            <Avatar size={45} icon={<UserOutlined />} />
            <Button onClick={logout}>Đăng xuất</Button>
          </div>
        </div>
        <Card className="mt-[10rem] max-w-[70%] mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center justify-between w-full">
              <div>
                <p className="text-[13px] text-[#8d8d8d]">Tài khoản thanh toán</p>
                <p className="font-bold text-[16px]">{userInfo?.bank_card?.code || ""}</p>
              </div>
              <div>
                <p className="text-[13px] text-[#8d8d8d]">Số dư khả dụng</p>
                <p className="font-bold text-[16px]">
                  {userInfo.bank_card
                    ? Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(userInfo?.bank_card?.mount || 0)
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </header>
      <div className="px-4">
        {!show && (
          <div className="mt-4">
            <Button onClick={() => setShow(true)}>Tạo giao dịch</Button>
          </div>
        )}
        {show && (
          <div className="w-[70%] mx-auto pt-4">
            <p className="font-semibold text-[18px] text-center mb-4">
              Chuyển tiền nhanh 24/7
            </p>
            <StepTransaction
              onSuccess={() => {
                getData({ user_id: user_id });
              }}
              onCancel={handelCancel}
              data={userInfo}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
