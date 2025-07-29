import { NonRetriableError } from "inngest";
import {inngest} from "../client.js"
import User from "../../models/user.js";
import {sendEmail} from "../../utils/mailer.js";


export const onUserSingup = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },

  async ({ event, step }) => {
    try {
      const { email } = event.data;
      const user = await step.run("get_user_mail", async () => {
        // Simulate fetching user data from a database
        const userObject = await User.findOne({ email });
        if (!userObject) {
          throw new NonRetriableError("User not found");
        }
        return userObject;
      });

      await step.run("send welcome mail", async () => {
        const subject = "welcome to our service";
        const message = `Hello ${user.name}, welcome to our service!
            \n\n
            We are glad to have you on board.`;

        await user.sendEmail(sendEmail(user.email, subject, message));
      });
      return { success: true, userId: user.id, Name: user.name };
    } catch (error) {
      console.error("Error in user signup function:", error.message);
      
      return { success: false };
    }
  }
);