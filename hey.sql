--
-- PostgreSQL database dump
--

\restrict wUpIyAJbUw1iLhHgswpjRJrNKO9GIih4pXR5GIiGmMUlzmvHcVlRbwsFfpu3WmG

-- Dumped from database version 14.22 (Homebrew)
-- Dumped by pg_dump version 14.22 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: friendships; Type: TABLE; Schema: public; Owner: joshuazacek
--

CREATE TABLE public.friendships (
    friendship_id uuid DEFAULT gen_random_uuid() NOT NULL,
    requester uuid NOT NULL,
    addressee uuid NOT NULL,
    pending boolean DEFAULT true NOT NULL,
    CONSTRAINT requester_and_addressee_not_same_user CHECK ((requester <> addressee))
);


ALTER TABLE public.friendships OWNER TO joshuazacek;

--
-- Name: group_chats; Type: TABLE; Schema: public; Owner: joshuazacek
--

CREATE TABLE public.group_chats (
    group_chat_id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL
);


ALTER TABLE public.group_chats OWNER TO joshuazacek;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: joshuazacek
--

CREATE TABLE public.messages (
    message_id uuid DEFAULT gen_random_uuid() NOT NULL,
    message character varying(1000) NOT NULL,
    group_chat boolean NOT NULL,
    sent_by uuid NOT NULL,
    sent_to_user uuid,
    sent_to_group uuid,
    date_created timestamp with time zone NOT NULL,
    CONSTRAINT correct_sent_to_field_used CHECK (((group_chat AND (sent_to_group IS NOT NULL) AND (sent_to_user IS NULL)) OR ((NOT group_chat) AND (sent_to_user IS NOT NULL) AND (sent_to_group IS NULL))))
);


ALTER TABLE public.messages OWNER TO joshuazacek;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: joshuazacek
--

CREATE TABLE public.sessions (
    session_id text NOT NULL,
    user_id uuid NOT NULL,
    expires timestamp with time zone NOT NULL,
    verified boolean DEFAULT false NOT NULL
);


ALTER TABLE public.sessions OWNER TO joshuazacek;

--
-- Name: users; Type: TABLE; Schema: public; Owner: joshuazacek
--

CREATE TABLE public.users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(20) NOT NULL,
    avatar text,
    CONSTRAINT check_account_code_format CHECK ((lower((code)::text) ~* '^[a-z]{3,6}-[a-z]{3,6}-[a-z]{3,6}$'::text))
);


ALTER TABLE public.users OWNER TO joshuazacek;

--
-- Name: verification_codes; Type: TABLE; Schema: public; Owner: joshuazacek
--

CREATE TABLE public.verification_codes (
    session_id text NOT NULL,
    code integer NOT NULL,
    expires timestamp with time zone NOT NULL,
    CONSTRAINT code_is_6_digits CHECK (((code >= 100000) AND (code <= 999999)))
);


ALTER TABLE public.verification_codes OWNER TO joshuazacek;

--
-- Name: friendships friendships_pkey; Type: CONSTRAINT; Schema: public; Owner: joshuazacek
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_pkey PRIMARY KEY (friendship_id);


--
-- Name: group_chats group_chats_pkey; Type: CONSTRAINT; Schema: public; Owner: joshuazacek
--

ALTER TABLE ONLY public.group_chats
    ADD CONSTRAINT group_chats_pkey PRIMARY KEY (group_chat_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: joshuazacek
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: joshuazacek
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (session_id);


--
-- Name: users users_code_key; Type: CONSTRAINT; Schema: public; Owner: joshuazacek
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_code_key UNIQUE (code);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: joshuazacek
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: verification_codes verification_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: joshuazacek
--

ALTER TABLE ONLY public.verification_codes
    ADD CONSTRAINT verification_codes_pkey PRIMARY KEY (session_id);


--
-- Name: friendships_least_greatest_idx; Type: INDEX; Schema: public; Owner: joshuazacek
--

CREATE UNIQUE INDEX friendships_least_greatest_idx ON public.friendships USING btree (LEAST(requester, addressee), GREATEST(requester, addressee));


--
-- Name: messages_date_created_idx; Type: INDEX; Schema: public; Owner: joshuazacek
--

CREATE INDEX messages_date_created_idx ON public.messages USING btree (date_created);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: joshuazacek
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (lower((email)::text));


--
-- Name: friendships friendships_addressee_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joshuazacek
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_addressee_fkey FOREIGN KEY (addressee) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: friendships friendships_requester_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joshuazacek
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_requester_fkey FOREIGN KEY (requester) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: messages messages_sent_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joshuazacek
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sent_by_fkey FOREIGN KEY (sent_by) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: messages messages_sent_to_group_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joshuazacek
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sent_to_group_fkey FOREIGN KEY (sent_to_group) REFERENCES public.group_chats(group_chat_id) ON DELETE CASCADE;


--
-- Name: messages messages_sent_to_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joshuazacek
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sent_to_user_fkey FOREIGN KEY (sent_to_user) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joshuazacek
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: verification_codes verification_codes_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joshuazacek
--

ALTER TABLE ONLY public.verification_codes
    ADD CONSTRAINT verification_codes_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(session_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict wUpIyAJbUw1iLhHgswpjRJrNKO9GIih4pXR5GIiGmMUlzmvHcVlRbwsFfpu3WmG

