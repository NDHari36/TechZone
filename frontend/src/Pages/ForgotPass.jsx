import axios from "axios";

export default function UserItem({ user }) {
  const handleResetPassword = async (userId) => {
    try {
      const res = await axios.put(
        `https://techzone-api-wkxx.onrender.com/api/auth/reset-password-default/${userId}`,
      );

      alert("Password đã reset về: 123456");

      console.log(res.data);
    } catch (err) {
      console.log(err);

      alert("Reset password thất bại");
    }
  };

  return (
    <div>
      <h3>{user.username}</h3>

      <button onClick={() => handleResetPassword(user.id)}>
        Reset Password
      </button>
    </div>
  );
}
