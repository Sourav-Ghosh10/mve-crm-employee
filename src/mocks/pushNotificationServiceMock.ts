// @ts-nocheck
import { jest } from "@jest/globals";

const pushNotificationService = {
  init: jest.fn(),
  unregisterToken: jest.fn(),
  listenForMessages: jest.fn(() => () => {}),
};

export default pushNotificationService;
