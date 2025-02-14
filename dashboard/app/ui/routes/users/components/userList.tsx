import { AnimatePresence, motion } from "motion/react";
import { Fragment } from "react/jsx-runtime";
import { Role, type User } from "~/domain/user";
import DeleteUser from "./deleteUser";

export default function UserList(props: { users: User[] }) {
  const listAnim = {
    initial: { originY: 0, scaleY: 0, height: 0 },
    animate: { originY: 0, scaleY: 1, height: "auto" },
    exit: { originY: 0, scaleY: 0, height: 0, opacity: 0 },
    transition: { duration: 0.2, ease: "easeInOut" },
  };

  return (
    <div>
      <div className="grid grid-cols-[80%,10%,10%] items-center p-2 text-gray-600">
        <AnimatePresence initial={false} presenceAffectsLayout={true}>
          {props.users.map((u) => (
            <Fragment key={`user_${u.id}`}>
              <motion.div
                variants={listAnim}
                initial="initial"
                animate="animate"
                exit="exit"
                key={`email_${u.id}`}
              >
                <div className="break-all pb-2">
                  {u.role === Role.ADMIN ? (
                    <span className="font-bold">{u.email}</span>
                  ) : (
                    <span>{u.email}</span>
                  )}
                </div>
              </motion.div>
              <motion.div
                variants={listAnim}
                initial="initial"
                animate="animate"
                exit="exit"
                key={`role_${u.id}`}
              >
                <div className="pb-2">
                  {u.role === Role.ADMIN ? (
                    <span className="font-bold">{u.role}</span>
                  ) : (
                    <span>{u.role}</span>
                  )}
                </div>
              </motion.div>
              <motion.div
                variants={listAnim}
                initial="initial"
                animate="animate"
                exit="exit"
                key={`trash_${u.id}`}
              >
                <div className="pb-2 flex justify-end">
                  <DeleteUser id={u.id} email={u.email} role={u.role} />
                </div>
              </motion.div>
              <motion.div
                variants={listAnim}
                initial="initial"
                animate="animate"
                exit="exit"
                key={`separator_${u.id}`}
                className="col-span-3"
              >
                <div className="w-full h-0.5 bg-gray-100 mb-2"></div>
              </motion.div>
            </Fragment>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
