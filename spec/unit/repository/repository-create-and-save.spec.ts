import { mocked } from 'ts-jest/utils';

import Client from '../../../lib/client';
import Repository from '../../../lib/repository/repository';
import { JsonRepository, HashRepository } from '../../../lib/repository/repository';

import {
  A_STRING_ARRAY, A_STRING_ARRAY_JOINED,
  A_DATE, A_DATE_EPOCH, A_DATE_EPOCH_STRING,
  A_POINT, A_POINT_STRING } from '../../helpers/example-data';

import { simpleHashSchema, SimpleHashEntity, SimpleJsonEntity, simpleJsonSchema } from '../helpers/test-entity-and-schema';

jest.mock('../../../lib/client');


beforeEach(() => mocked(Client).mockReset());

describe("Repository", () => {

  let client: Client;

  describe("#createAndSave", () => {

    beforeAll(() => client = new Client());

    describe("to a hash", () => {

      let repository: Repository<SimpleHashEntity>;
      let entity: SimpleHashEntity;

      beforeAll(async () => repository = new HashRepository(simpleHashSchema, client));

      describe("when creating and saving a fully populated entity", () => {
        beforeEach(async () => {
          entity = await repository.createAndSave({ aString: 'foo', aNumber: 42, aBoolean: false,
            aPoint: A_POINT, aDate: A_DATE, someStrings: A_STRING_ARRAY });
        });
  
        it("returns the populated entity", () => {
          expect(entity.aString).toBe('foo');
          expect(entity.aNumber).toBe(42);
          expect(entity.aBoolean).toBe(false);
          expect(entity.aPoint).toEqual(A_POINT);
          expect(entity.aDate).toEqual(A_DATE);
          expect(entity.someStrings).toEqual(A_STRING_ARRAY);
        });

        it("saves the entity data to the key", () =>
          expect(Client.prototype.hsetall).toHaveBeenCalledWith(
            expect.stringMatching(/^SimpleHashEntity:/), {
              aString: 'foo', aNumber: '42', aBoolean: '0',
              aPoint: A_POINT_STRING, aDate: A_DATE_EPOCH_STRING, someStrings: A_STRING_ARRAY_JOINED }));
      });
  
      describe("when saving an empty entity", () => {
        beforeEach(async () => entity = await repository.createAndSave({}));
  
        it("returns the empty entity", () => {
          expect(entity.aString).toBeNull();
          expect(entity.aNumber).toBeNull();
          expect(entity.aBoolean).toBeNull();
          expect(entity.aPoint).toBeNull();
          expect(entity.aDate).toBeNull();
          expect(entity.someStrings).toBeNull();
        });

        it("unlinks the key", () =>
          expect(Client.prototype.unlink).toHaveBeenCalledWith(expect.stringMatching(/^SimpleHashEntity:/)));
      });
    });

    describe("to JSON", () => {

      let repository: Repository<SimpleJsonEntity>;
      let entity: SimpleJsonEntity;

      beforeAll(async () => repository = new JsonRepository(simpleJsonSchema, client));

      describe("when creating and saving a fully populated entity", () => {
        beforeEach(async () => {
          entity = await repository.createAndSave({ aString: 'foo', aNumber: 42, aBoolean: false,
            aPoint: A_POINT, aDate: A_DATE, someStrings: A_STRING_ARRAY });
        });
  
        it("returns the populated entity", () => {
          expect(entity.aString).toBe('foo');
          expect(entity.aNumber).toBe(42);
          expect(entity.aBoolean).toBe(false);
          expect(entity.aPoint).toEqual(A_POINT);
          expect(entity.aDate).toEqual(A_DATE);
          expect(entity.someStrings).toEqual(A_STRING_ARRAY);
        });

        it("saves the entity data to the key", () =>
          expect(Client.prototype.jsonset).toHaveBeenCalledWith(
            expect.stringMatching(/^SimpleJsonEntity:/), {
              aString: 'foo', aNumber: 42, aBoolean: false,
              aPoint: A_POINT_STRING, aDate: A_DATE_EPOCH, someStrings: A_STRING_ARRAY }));
      });
  
      describe("when saving an empty entity", () => {
        beforeEach(async () => entity = await repository.createAndSave({}));
  
        it("returns the empty entity", () => {
          expect(entity.aString).toBeNull();
          expect(entity.aNumber).toBeNull();
          expect(entity.aBoolean).toBeNull();
          expect(entity.aPoint).toBeNull();
          expect(entity.aDate).toBeNull();
          expect(entity.someStrings).toBeNull();
        });

        it("unlinks the key", () =>
          expect(Client.prototype.unlink).toHaveBeenCalledWith(
            expect.stringMatching(/^SimpleJsonEntity:/)));
      });
    });
  });
});
