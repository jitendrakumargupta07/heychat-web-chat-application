const UserList = ({ users = [], onSelectUser }) => {
  if (!users.length) {
    return (
      <p className="p-3 text-sm text-gray-500">
        No users found
      </p>
    );
  }

  return (
    <>
      {users.map((u) => (
        <div
          key={u._id}
          onClick={() => onSelectUser(u)}
          className="p-3 cursor-pointer hover:bg-[#141414]"
        >
          {u.name}
        </div>
      ))}
    </>
  );
};

export default UserList;
