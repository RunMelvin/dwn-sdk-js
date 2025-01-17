import { expect } from 'chai';
import { ProtocolAuthorization } from '../../src/core/protocol-authorization.js';
import { ProtocolRuleSet } from '../../src/index.js';
import { TestDataGenerator } from '../utils/test-data-generator.js';

describe('Protocol-Based Authorization', async () => {
  describe('verifyAllowedRequester()', async () => {
    it('should throw if action performed is not in an allowed action list', async () => {
      const did = 'did:example:alice';
      const ruleSet = {
        allow: {
          maliciousActor: { // unknown requester rule
            to: ['delete']
          }
        }
      };

      expect(() => {
        ProtocolAuthorization['verifyAllowedRequester'](did, did, ruleSet as any, [], new Map());
      }).throws('no matching allow requester condition');
    });
  });

  describe('verifyAllowedActions()', async () => {
    it('should throw if requester DID is not the target DWN owner when no allow rule defined', async () => {
      const alice = await TestDataGenerator.generatePersona();
      const bob = await TestDataGenerator.generatePersona();
      const { recordsWrite } = await TestDataGenerator.generateRecordsWriteMessage({ requester: bob, target: alice });
      const ruleSet: ProtocolRuleSet = {};

      expect(() => {
        ProtocolAuthorization['verifyAllowedActions'](bob.did, recordsWrite, ruleSet);
      }).throws('no allow rule defined for RecordsWrite');
    });

    it('should throw if action performed is not in an allowed action list', async () => {
      const did = 'did:example:alice';
      const { recordsWrite } = await TestDataGenerator.generateRecordsWriteMessage();
      const ruleSet: ProtocolRuleSet = {
        allow: {
          anyone: {
            to: ['delete'] // does not include 'write' which is needed for RecordsWrite messages
          }
        }
      };

      expect(() => {
        ProtocolAuthorization['verifyAllowedActions'](did, recordsWrite, ruleSet);
      }).throws('not in list of allowed actions');
    });
  });
});