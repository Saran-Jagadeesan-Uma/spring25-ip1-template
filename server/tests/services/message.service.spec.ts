import mongoose from 'mongoose';
import MessageModel from '../../models/messages.model';
import { getMessages, saveMessage } from '../../services/message.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const message1 = {
  msg: 'Hello',
  msgFrom: 'User1',
  msgDateTime: new Date('2024-06-04'),
};

const message2 = {
  msg: 'Hi',
  msgFrom: 'User2',
  msgDateTime: new Date('2024-06-05'),
};

describe('Message model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveMessage', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return saved message', async () => {
      mockingoose(MessageModel).toReturn(message1, 'create');

      const savedMessage = await saveMessage(message1);

      expect(savedMessage).toMatchObject(message1);
    });

    it('should return an error if saving fails', async () => {
      jest.spyOn(MessageModel, 'create').mockImplementationOnce(() => {
        throw new Error('DB error');
      });

      const result = await saveMessage(message1);
      expect(result).toEqual({ error: 'Error saving message' });
    });
  });

  describe('getMessages', () => {
    it('should return all sorted messages', async () => {
      const message1WithId = { ...message1, _id: new mongoose.Types.ObjectId() };
      const message2WithId = { ...message2, _id: new mongoose.Types.ObjectId() };
      mockingoose(MessageModel).toReturn([message1WithId, message2WithId], 'find');
      const messages = await getMessages();
      expect(messages[0]).toMatchObject(message1);
      expect(messages[1]).toMatchObject(message2);
    });

    it('should return an empty array incase of an error', async () => {
      jest.spyOn(MessageModel, 'find').mockImplementationOnce(() => {
        throw new Error('DB error');
      });

      const messages = await getMessages();
      expect(messages).toEqual([]);
    });
  });
});
