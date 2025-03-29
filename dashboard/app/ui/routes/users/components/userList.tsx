import { AnimatePresence, motion } from "motion/react";
import { Fragment } from "react/jsx-runtime";
import { Role, type User } from "~/domain/user";
import DeleteUser from "./deleteUser";
import { scrollToElement } from "~/utils/scrollTo";
import AdminIcon from "~/ui/components/icons/adminIcon";
import UserIcon from "~/ui/components/icons/userIcon";

export default function UserList(props: { users: User[] }) {
  const listAnim = {
    initial: { originY: 0, scaleY: 0, height: 0 },
    animate: { originY: 0, scaleY: 1, height: "auto" },
    exit: { originY: 0, scaleY: 0, height: 0, opacity: 0 },
    transition: { duration: 0.2, ease: "easeInOut" },
  };

  return (
    <div>
      <div className="grid md:grid-cols-[75%,15%,10%] grid-cols-[60%,25%,15%] items-center p-2 text-gray-600">
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
                  {u.role === Role.ADMIN || u.role === Role.SUPERADMIN ? (
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
                <div className="pb-2 text-xs">
                  {u.role === Role.ADMIN || u.role === Role.SUPERADMIN ? (
                    <div className="flex justify-center items-center gap-1">
                      <AdminIcon />
                      <span className="font-bold">{u.role}</span>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center gap-1">
                      <UserIcon />
                      <span>{u.role}</span>
                    </div>
                  )}
                </div>
              </motion.div>
              <motion.div
                variants={listAnim}
                initial="initial"
                animate="animate"
                exit="exit"
                key={`trash_${u.id}`}
                id={`trash_${u.id}`}
              >
                <div
                  className="pb-2 flex justify-end"
                  onClick={() => {
                    setTimeout(() => {
                      scrollToElement(`trash_${u.id}`);
                    }, 200);
                  }}
                >
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
