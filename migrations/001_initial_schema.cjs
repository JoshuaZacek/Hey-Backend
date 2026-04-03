/* eslint-disable camelcase */

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

  pgm.createTable('users', {
    user_id: {
      type: 'uuid',
      notNull: true,
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    code: {
      type: 'varchar(20)',
      notNull: true,
      unique: true,
    },
    avatar: {
      type: 'text',
    },
  });

  pgm.addConstraint('users', 'check_account_code_format', {
    check: "lower(code) ~* '^[a-z]{3,6}-[a-z]{3,6}-[a-z]{3,6}$'",
  });

  pgm.createIndex('users', 'lower(email)', {
    name: 'users_email_key',
    unique: true,
  });

  pgm.createTable('group_chats', {
    group_chat_id: {
      type: 'uuid',
      notNull: true,
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
  });

  pgm.createTable('sessions', {
    session_id: {
      type: 'text',
      notNull: true,
      primaryKey: true,
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(user_id)',
      onDelete: 'CASCADE',
    },
    expires: {
      type: 'timestamptz',
      notNull: true,
    },
    verified: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
  });

  pgm.createTable('verification_codes', {
    session_id: {
      type: 'text',
      notNull: true,
      primaryKey: true,
      references: 'sessions(session_id)',
      onDelete: 'CASCADE',
    },
    code: {
      type: 'integer',
      notNull: true,
    },
    expires: {
      type: 'timestamptz',
      notNull: true,
    },
  });

  pgm.addConstraint('verification_codes', 'code_is_6_digits', {
    check: '(code >= 100000) AND (code <= 999999)',
  });

  pgm.createTable('friendships', {
    friendship_id: {
      type: 'uuid',
      notNull: true,
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    requester: {
      type: 'uuid',
      notNull: true,
      references: 'users(user_id)',
      onDelete: 'CASCADE',
    },
    addressee: {
      type: 'uuid',
      notNull: true,
      references: 'users(user_id)',
      onDelete: 'CASCADE',
    },
    pending: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
  });

  pgm.addConstraint('friendships', 'requester_and_addressee_not_same_user', {
    check: 'requester <> addressee',
  });

  pgm.createIndex('friendships', ['LEAST(requester, addressee)', 'GREATEST(requester, addressee)'], {
    name: 'friendships_least_greatest_idx',
    unique: true,
  });

  pgm.createTable('messages', {
    message_id: {
      type: 'uuid',
      notNull: true,
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    message: {
      type: 'varchar(1000)',
      notNull: true,
    },
    group_chat: {
      type: 'boolean',
      notNull: true,
    },
    sent_by: {
      type: 'uuid',
      notNull: true,
      references: 'users(user_id)',
      onDelete: 'CASCADE',
    },
    sent_to_user: {
      type: 'uuid',
      references: 'users(user_id)',
      onDelete: 'CASCADE',
    },
    sent_to_group: {
      type: 'uuid',
      references: 'group_chats(group_chat_id)',
      onDelete: 'CASCADE',
    },
    date_created: {
      type: 'timestamptz',
      notNull: true,
    },
  });

  pgm.addConstraint('messages', 'correct_sent_to_field_used', {
    check:
      '(group_chat AND (sent_to_group IS NOT NULL) AND (sent_to_user IS NULL)) OR ((NOT group_chat) AND (sent_to_user IS NOT NULL) AND (sent_to_group IS NULL))',
  });

  pgm.createIndex('messages', 'date_created', {
    name: 'messages_date_created_idx',
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('messages', { ifExists: true, cascade: true });
  pgm.dropTable('friendships', { ifExists: true, cascade: true });
  pgm.dropTable('verification_codes', { ifExists: true, cascade: true });
  pgm.dropTable('sessions', { ifExists: true, cascade: true });
  pgm.dropTable('group_chats', { ifExists: true, cascade: true });
  pgm.dropTable('users', { ifExists: true, cascade: true });
};
