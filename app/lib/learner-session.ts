"use client";

import { createUsernameStore } from "./username-store";

// The learner using this device. Set by logging in to any ComputerSteps website that uses the
// shared identity, so practice tasks follow the learner from one website to another.
const store = createUsernameStore("computer-steps:learner");

export const setLearner = store.logIn;
export const clearLearner = store.logOut;
export const useLearner = store.useUsername;
