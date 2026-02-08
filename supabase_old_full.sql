--
-- PostgreSQL database dump
--

\restrict ZgPXZ3gqo7WS7Jue5Tbd3hJYgY5vB50ekwOpMgeFMDhryyZrftNkirmB286AQlm

-- Dumped from database version 17.4
-- Dumped by pg_dump version 18.0 (Ubuntu 18.0-1.pgdg22.04+3)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_
        -- Filter by action early - only get subscriptions interested in this action
        -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
        and (subs.action_filter = '*' or subs.action_filter = action::text);

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


--
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


--
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    officer_id uuid,
    event text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    user_agent text,
    ip_address text,
    referrer text,
    session_id text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name text NOT NULL,
    service text NOT NULL,
    key_value text NOT NULL,
    is_active boolean DEFAULT true,
    last_used_at timestamp without time zone,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    website text,
    license_number text,
    address jsonb,
    phone text,
    email text,
    subscription text DEFAULT 'basic'::text,
    subscription_expires_at timestamp without time zone,
    is_active boolean DEFAULT true,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    admin_email text,
    admin_email_verified boolean DEFAULT false,
    admin_user_id uuid,
    invite_status text DEFAULT 'pending'::text,
    invite_sent_at timestamp without time zone,
    invite_expires_at timestamp without time zone,
    invite_token text,
    deactivated boolean DEFAULT false,
    company_tagline text,
    company_description text,
    company_nmls_number text,
    company_established_year integer,
    company_team_size text,
    company_specialties jsonb DEFAULT '[]'::jsonb,
    company_awards jsonb DEFAULT '[]'::jsonb,
    company_testimonials jsonb DEFAULT '[]'::jsonb,
    company_social_media jsonb DEFAULT '{}'::jsonb,
    company_branding jsonb DEFAULT '{}'::jsonb,
    company_contact_info jsonb DEFAULT '{}'::jsonb,
    company_business_hours jsonb DEFAULT '{}'::jsonb,
    company_service_areas jsonb DEFAULT '[]'::jsonb,
    company_languages jsonb DEFAULT '[]'::jsonb,
    company_certifications jsonb DEFAULT '[]'::jsonb,
    company_insurance_info jsonb DEFAULT '{}'::jsonb,
    company_financial_info jsonb DEFAULT '{}'::jsonb,
    company_marketing_info jsonb DEFAULT '{}'::jsonb,
    company_privacy_settings jsonb DEFAULT '{}'::jsonb,
    company_seo_settings jsonb DEFAULT '{}'::jsonb,
    company_analytics_settings jsonb DEFAULT '{}'::jsonb,
    company_integration_settings jsonb DEFAULT '{}'::jsonb,
    company_notification_settings jsonb DEFAULT '{}'::jsonb,
    company_backup_settings jsonb DEFAULT '{}'::jsonb,
    company_security_settings jsonb DEFAULT '{}'::jsonb,
    company_compliance_settings jsonb DEFAULT '{}'::jsonb,
    company_custom_fields jsonb DEFAULT '{}'::jsonb,
    company_metadata jsonb DEFAULT '{}'::jsonb,
    company_version integer DEFAULT 1,
    company_last_updated_by uuid,
    company_approval_status text DEFAULT 'pending'::text,
    company_approval_notes text,
    company_approval_date timestamp without time zone,
    company_approval_by uuid,
    has_default_content_access boolean DEFAULT false
);


--
-- Name: email_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    verification_code text NOT NULL,
    code_expires_at timestamp without time zone NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    verified_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    officer_id uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    source text NOT NULL,
    status text DEFAULT 'new'::text,
    priority text DEFAULT 'medium'::text,
    loan_details jsonb,
    property_details jsonb,
    credit_score integer,
    loan_amount numeric(15,2),
    down_payment numeric(15,2),
    notes text,
    tags jsonb DEFAULT '[]'::jsonb,
    custom_fields jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    conversion_stage text DEFAULT 'lead'::text,
    conversion_date timestamp without time zone,
    application_date timestamp without time zone,
    approval_date timestamp without time zone,
    closing_date timestamp without time zone,
    loan_amount_closed numeric(15,2),
    commission_earned numeric(10,2),
    response_time_hours integer,
    last_contact_date timestamp without time zone,
    contact_count integer DEFAULT 0,
    lead_quality_score integer,
    geographic_location text
);


--
-- Name: loan_officer_public_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_officer_public_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    company_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    public_slug text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    expires_at timestamp without time zone,
    max_uses integer,
    current_uses integer DEFAULT 0 NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: mortech_api_calls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mortech_api_calls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    officer_id uuid NOT NULL,
    company_id uuid NOT NULL,
    called_at timestamp without time zone DEFAULT now() NOT NULL,
    search_params jsonb DEFAULT '{}'::jsonb
);


--
-- Name: mortech_email_rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mortech_email_rate_limits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    called_at timestamp without time zone DEFAULT now() NOT NULL,
    search_params jsonb DEFAULT '{}'::jsonb
);


--
-- Name: officer_content_faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.officer_content_faqs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    officer_id uuid NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: officer_content_guides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.officer_content_guides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    officer_id uuid NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    file_url text NOT NULL,
    file_name text NOT NULL,
    file_type text,
    cloudinary_public_id text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    funnel_url text
);


--
-- Name: officer_content_videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.officer_content_videos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    officer_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    category text NOT NULL,
    video_url text NOT NULL,
    thumbnail_url text,
    duration text,
    cloudinary_public_id text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: page_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    officer_id uuid NOT NULL,
    template_id uuid NOT NULL,
    template text NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_published boolean DEFAULT false,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: page_settings_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_settings_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_settings_id uuid NOT NULL,
    company_id uuid NOT NULL,
    officer_id uuid NOT NULL,
    template text NOT NULL,
    settings jsonb NOT NULL,
    version text NOT NULL,
    storage_path text,
    is_auto_generated boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: public_link_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.public_link_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    link_id uuid NOT NULL,
    ip_address text,
    user_agent text,
    referrer text,
    accessed_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: rate_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    loan_type text NOT NULL,
    loan_term integer NOT NULL,
    rate numeric(6,4) NOT NULL,
    apr numeric(6,4) NOT NULL,
    points numeric(6,2) DEFAULT '0'::numeric,
    fees numeric(10,2) DEFAULT '0'::numeric,
    monthly_payment numeric(12,2),
    loan_amount numeric(15,2),
    credit_score integer,
    ltv numeric(5,2),
    dti numeric(5,2),
    is_active boolean DEFAULT true,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: selected_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.selected_rates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    officer_id uuid NOT NULL,
    company_id uuid NOT NULL,
    rate_data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    preview_image text,
    is_active boolean DEFAULT true,
    is_premium boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_default boolean DEFAULT false,
    user_id uuid,
    colors jsonb DEFAULT '{}'::jsonb NOT NULL,
    typography jsonb DEFAULT '{}'::jsonb NOT NULL,
    content jsonb DEFAULT '{}'::jsonb NOT NULL,
    layout jsonb DEFAULT '{}'::jsonb NOT NULL,
    advanced jsonb DEFAULT '{}'::jsonb NOT NULL,
    classes jsonb DEFAULT '{}'::jsonb NOT NULL,
    header_modifications jsonb DEFAULT '{}'::jsonb,
    body_modifications jsonb DEFAULT '{}'::jsonb,
    right_sidebar_modifications jsonb DEFAULT '{}'::jsonb,
    layout_config jsonb DEFAULT '{}'::jsonb,
    is_selected boolean DEFAULT false,
    footer_modifications jsonb DEFAULT '{}'::jsonb
);


--
-- Name: user_companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    company_id uuid NOT NULL,
    role text DEFAULT 'employee'::text NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    joined_at timestamp without time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    first_name text,
    last_name text,
    phone text,
    avatar text,
    role text DEFAULT 'employee'::text NOT NULL,
    is_active boolean DEFAULT true,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    deactivated boolean DEFAULT false,
    invite_status text DEFAULT 'pending'::text,
    invite_sent_at timestamp without time zone,
    invite_expires_at timestamp without time zone,
    invite_token text,
    nmls_number text
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: messages_2025_09_09; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_09 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_10; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_10 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_11; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_11 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_12; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_12 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_13; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_13 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_14; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_14 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages_2025_09_09; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_09 FOR VALUES FROM ('2025-09-09 00:00:00') TO ('2025-09-10 00:00:00');


--
-- Name: messages_2025_09_10; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_10 FOR VALUES FROM ('2025-09-10 00:00:00') TO ('2025-09-11 00:00:00');


--
-- Name: messages_2025_09_11; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_11 FOR VALUES FROM ('2025-09-11 00:00:00') TO ('2025-09-12 00:00:00');


--
-- Name: messages_2025_09_12; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_12 FOR VALUES FROM ('2025-09-12 00:00:00') TO ('2025-09-13 00:00:00');


--
-- Name: messages_2025_09_13; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_13 FOR VALUES FROM ('2025-09-13 00:00:00') TO ('2025-09-14 00:00:00');


--
-- Name: messages_2025_09_14; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_14 FOR VALUES FROM ('2025-09-14 00:00:00') TO ('2025-09-15 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	923489df-db07-49ba-beff-b641f73d467f	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@loanplatform.com","user_id":"90edee2f-b49f-4cd3-b166-7a11b55488bb","user_phone":""}}	2025-09-04 12:26:53.159967+00	
00000000-0000-0000-0000-000000000000	c7b6a05c-cf10-43ff-bb37-ff8cc72523aa	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@loanplatform.com","user_id":"90edee2f-b49f-4cd3-b166-7a11b55488bb","user_phone":""}}	2025-09-04 12:27:15.712549+00	
00000000-0000-0000-0000-000000000000	f0475127-3f85-4e37-abd7-2b8e150102a1	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@loanplatform.com","user_id":"14385756-259e-4995-8aff-eaf8fe1988e7","user_phone":""}}	2025-09-04 12:27:16.568757+00	
00000000-0000-0000-0000-000000000000	c8e673dc-a9a3-4b13-a133-dc688f9e23df	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 12:29:44.127338+00	
00000000-0000-0000-0000-000000000000	7ae2df70-f49a-40b3-b3f3-fe50cae03861	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 12:37:23.763335+00	
00000000-0000-0000-0000-000000000000	ca7fe8fa-c311-4474-bfb0-70a9533597c5	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 12:45:21.599636+00	
00000000-0000-0000-0000-000000000000	2a2dd7f9-5f34-434c-9fcf-1a7761d04828	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 12:50:09.000803+00	
00000000-0000-0000-0000-000000000000	cc3380c3-ff6a-4808-83d0-86ff96123e05	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 12:55:20.26287+00	
00000000-0000-0000-0000-000000000000	6135b613-c6c8-4ac7-bd96-1a23df9e6802	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 12:56:18.348436+00	
00000000-0000-0000-0000-000000000000	ae69badf-551f-4776-bd02-93c70a895d09	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 12:57:05.150795+00	
00000000-0000-0000-0000-000000000000	9f903e4f-2bb9-4ed8-93b7-cbc9a0520678	{"action":"user_confirmation_requested","actor_id":"b53dd3b4-7957-4dad-a5dc-5df0fc8527a2","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-09-04 12:58:02.182306+00	
00000000-0000-0000-0000-000000000000	dbf7853c-db06-48bd-a0f6-d8a91ab81c36	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 13:04:25.958497+00	
00000000-0000-0000-0000-000000000000	93915c96-1b21-4c5a-9474-6362385f1b1c	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 13:13:30.268834+00	
00000000-0000-0000-0000-000000000000	906ec625-86e4-4c6c-aeca-28794856133e	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 13:59:22.066867+00	
00000000-0000-0000-0000-000000000000	aa794e3f-1b15-4fda-9890-2235dde8ad64	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 14:27:33.865353+00	
00000000-0000-0000-0000-000000000000	33d92ea0-19b9-4131-b3d6-472c0287952e	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 14:32:41.538478+00	
00000000-0000-0000-0000-000000000000	f3c8e4ac-c814-4c1f-865e-7001f1d66548	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 14:43:50.712335+00	
00000000-0000-0000-0000-000000000000	a5ec2e7a-74d4-46bf-8afb-219f75318701	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 14:48:33.633262+00	
00000000-0000-0000-0000-000000000000	dd43f45c-7a2a-436b-b475-2fb239ccac55	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 07:47:28.994582+00	
00000000-0000-0000-0000-000000000000	8acc82ef-78f2-47c2-8c97-836cd41b8dcd	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 07:47:29.012219+00	
00000000-0000-0000-0000-000000000000	cbfb0461-a4fc-4222-96d7-899f9132d8fc	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 07:47:55.936578+00	
00000000-0000-0000-0000-000000000000	801c81f1-48c2-412e-8e40-4130305382ee	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 07:47:55.939359+00	
00000000-0000-0000-0000-000000000000	86d5149a-c746-4b80-b9aa-c16e93ca683e	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 07:49:57.701727+00	
00000000-0000-0000-0000-000000000000	bdf97970-02b1-49bc-816d-0c7bb759d78f	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abdulrehman@sudostudy.com","user_id":"b53dd3b4-7957-4dad-a5dc-5df0fc8527a2","user_phone":""}}	2025-09-05 08:30:32.529129+00	
00000000-0000-0000-0000-000000000000	25946c7e-1971-485e-b1c9-a0f21cf9ad78	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"abdulrehman@sudostudy.com","user_id":"8f0d24d5-9d24-4a01-a025-50321b6a8c26","user_phone":""}}	2025-09-05 08:33:46.602952+00	
00000000-0000-0000-0000-000000000000	b504a7da-9b16-40e8-a080-06692424547b	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abdulrehman@sudostudy.com","user_id":"8f0d24d5-9d24-4a01-a025-50321b6a8c26","user_phone":""}}	2025-09-05 08:47:57.184658+00	
00000000-0000-0000-0000-000000000000	134ef536-1808-489e-bcde-d109e6f99f13	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 09:42:44.054842+00	
00000000-0000-0000-0000-000000000000	054aa432-5346-4d19-af84-bc086e89a45e	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 09:42:44.081546+00	
00000000-0000-0000-0000-000000000000	0f4ab99d-6105-4112-9461-75836c450b36	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 09:42:49.131687+00	
00000000-0000-0000-0000-000000000000	2ffcf621-faf7-4265-9b3a-27fee7780b98	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 09:42:49.134601+00	
00000000-0000-0000-0000-000000000000	afacbc44-6f69-46ee-aa57-6053365b55fc	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abdulrehman@sudostudy.com","user_id":"fb876868-680a-4d97-b287-90ea0d02c368"}}	2025-09-05 09:46:02.821316+00	
00000000-0000-0000-0000-000000000000	db74ab2d-4811-4f66-8f5c-4af34e2e9245	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abdulrehman@sudostudy.com","user_id":"fb876868-680a-4d97-b287-90ea0d02c368"}}	2025-09-05 09:51:43.501601+00	
00000000-0000-0000-0000-000000000000	9ce3af68-a67e-4ee6-aa95-8bf04398dde7	{"action":"user_signedup","actor_id":"fb876868-680a-4d97-b287-90ea0d02c368","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 09:52:31.525204+00	
00000000-0000-0000-0000-000000000000	c5b2921a-42ce-4c27-901b-aeb50dfa81da	{"action":"user_updated_password","actor_id":"fb876868-680a-4d97-b287-90ea0d02c368","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 09:52:59.147957+00	
00000000-0000-0000-0000-000000000000	bf99ab33-711f-4ee7-8637-6f2e2ce297bd	{"action":"user_modified","actor_id":"fb876868-680a-4d97-b287-90ea0d02c368","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 09:52:59.149383+00	
00000000-0000-0000-0000-000000000000	5a7cc5ac-70d5-463d-be62-5e69903dd268	{"action":"login","actor_id":"fb876868-680a-4d97-b287-90ea0d02c368","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 09:53:11.254882+00	
00000000-0000-0000-0000-000000000000	a4add004-23f4-4b29-a759-7b9318a635ca	{"action":"login","actor_id":"fb876868-680a-4d97-b287-90ea0d02c368","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 09:53:39.553511+00	
00000000-0000-0000-0000-000000000000	cbaa8fd0-254c-4936-8138-d0be0cc15923	{"action":"login","actor_id":"fb876868-680a-4d97-b287-90ea0d02c368","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 10:01:35.602809+00	
00000000-0000-0000-0000-000000000000	093788bf-eb40-4f7d-ae51-761b606aae63	{"action":"login","actor_id":"fb876868-680a-4d97-b287-90ea0d02c368","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 10:19:13.32801+00	
00000000-0000-0000-0000-000000000000	52c78dc8-4686-4b89-88bf-a1e6e234c974	{"action":"login","actor_id":"fb876868-680a-4d97-b287-90ea0d02c368","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 10:26:48.714585+00	
00000000-0000-0000-0000-000000000000	8fdc0c23-c585-4e9d-89e6-08010d94501e	{"action":"login","actor_id":"fb876868-680a-4d97-b287-90ea0d02c368","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 10:29:18.439366+00	
00000000-0000-0000-0000-000000000000	2684eb97-7fcb-4471-8671-08c8f26673cb	{"action":"login","actor_id":"fb876868-680a-4d97-b287-90ea0d02c368","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 10:36:43.328318+00	
00000000-0000-0000-0000-000000000000	071c93f9-5808-4b0c-884b-91bcb1dac6d6	{"action":"login","actor_id":"fb876868-680a-4d97-b287-90ea0d02c368","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 10:42:41.922559+00	
00000000-0000-0000-0000-000000000000	2c5771d8-53de-46a7-a80e-646e2751de37	{"action":"login","actor_id":"fb876868-680a-4d97-b287-90ea0d02c368","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 10:45:25.298529+00	
00000000-0000-0000-0000-000000000000	09509d45-2646-4293-add4-c59d953e6144	{"action":"login","actor_id":"fb876868-680a-4d97-b287-90ea0d02c368","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 10:47:51.731156+00	
00000000-0000-0000-0000-000000000000	caef2e72-eda5-47ed-a1c0-da050bb1bf46	{"action":"login","actor_id":"fb876868-680a-4d97-b287-90ea0d02c368","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 11:00:40.119559+00	
00000000-0000-0000-0000-000000000000	c5998dc9-f686-4f06-9b79-39e389b76772	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 11:01:30.595168+00	
00000000-0000-0000-0000-000000000000	0ebf38c0-6b15-43b5-8a06-d33a2f9101a6	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 11:01:30.597645+00	
00000000-0000-0000-0000-000000000000	30760428-2bf3-40bf-b962-c25452dea887	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 11:01:33.509314+00	
00000000-0000-0000-0000-000000000000	b5928a68-f453-4bbc-b15f-078b6fbbc212	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 11:01:34.24651+00	
00000000-0000-0000-0000-000000000000	2108ab44-a195-43df-8cf7-4345a60438ea	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 11:01:34.247929+00	
00000000-0000-0000-0000-000000000000	3a1ab9bb-039a-495d-adbd-d0586589cfd4	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 11:02:23.800514+00	
00000000-0000-0000-0000-000000000000	82bd699a-e9a6-4c35-be42-edabc3bed4af	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 11:02:25.999212+00	
00000000-0000-0000-0000-000000000000	c7dfbe2c-e11b-44c9-8aa8-9e9585b7586f	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 11:02:46.019959+00	
00000000-0000-0000-0000-000000000000	1c7c7f4c-e0e8-41ca-a8cb-461d7338e161	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"effectedars29@gmail.com","user_id":"ed1e771c-b068-4526-b5ce-60933d9a35ba"}}	2025-09-05 11:02:47.143998+00	
00000000-0000-0000-0000-000000000000	27832d95-3032-4f72-9b1e-ebcadb6f8b19	{"action":"user_signedup","actor_id":"ed1e771c-b068-4526-b5ce-60933d9a35ba","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 11:03:10.861712+00	
00000000-0000-0000-0000-000000000000	e7ecdc07-39f8-4173-8afa-c0193bf0a2e3	{"action":"user_updated_password","actor_id":"ed1e771c-b068-4526-b5ce-60933d9a35ba","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 11:03:26.831893+00	
00000000-0000-0000-0000-000000000000	a56469bd-a4a2-4cde-8e31-c41ab6eb334c	{"action":"user_modified","actor_id":"ed1e771c-b068-4526-b5ce-60933d9a35ba","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 11:03:26.832595+00	
00000000-0000-0000-0000-000000000000	00719c00-ff86-4be7-bafe-00d5a937c33d	{"action":"login","actor_id":"ed1e771c-b068-4526-b5ce-60933d9a35ba","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 11:27:42.958634+00	
00000000-0000-0000-0000-000000000000	d54b2296-8308-4813-aa33-4e20002142f9	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 11:28:54.226989+00	
00000000-0000-0000-0000-000000000000	568d545f-8389-4ca1-9248-efd4f797a1d2	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 11:29:00.001632+00	
00000000-0000-0000-0000-000000000000	7855339f-725e-4c9b-ad9c-de23abd3d9a3	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"de507b3e-fc6c-4c25-a79b-f8645523b080"}}	2025-09-05 11:59:34.681369+00	
00000000-0000-0000-0000-000000000000	db856327-ef1c-494b-b7d3-850ae075ff78	{"action":"user_signedup","actor_id":"de507b3e-fc6c-4c25-a79b-f8645523b080","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 12:15:35.400049+00	
00000000-0000-0000-0000-000000000000	e3bfe997-d42d-435a-9a6a-4d9fa547e2db	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 12:17:27.859441+00	
00000000-0000-0000-0000-000000000000	1f2d285b-f4ce-451b-a117-010aa40dc801	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 12:17:35.627478+00	
00000000-0000-0000-0000-000000000000	5536cf59-55bc-41a3-9aa6-d344769ad0aa	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 12:17:36.16814+00	
00000000-0000-0000-0000-000000000000	c18a5180-1435-4675-82b3-bb95ffaa2e3a	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 12:17:36.169299+00	
00000000-0000-0000-0000-000000000000	77032490-fe61-478a-9132-3e5c99daa265	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 12:17:44.147768+00	
00000000-0000-0000-0000-000000000000	2c053770-100c-4139-95c0-f67ddf92994d	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 12:18:16.181411+00	
00000000-0000-0000-0000-000000000000	44a9c6a5-031a-439a-84d8-b8fc859e9e19	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hussnainali50674@gmail.com","user_id":"208d5d7b-98e5-48fd-9b60-7007da2e5561"}}	2025-09-05 12:18:16.693796+00	
00000000-0000-0000-0000-000000000000	927bb05e-265a-4d8c-87ce-11a6dfc4632c	{"action":"user_signedup","actor_id":"208d5d7b-98e5-48fd-9b60-7007da2e5561","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 12:18:36.949672+00	
00000000-0000-0000-0000-000000000000	43778ee7-9edc-44a9-83a0-aa0ff11bb1d0	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 12:18:37.968934+00	
00000000-0000-0000-0000-000000000000	bbef309b-86fe-48fa-95be-48b4bd5c09d2	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 12:18:37.969601+00	
00000000-0000-0000-0000-000000000000	4f1379d7-e5f6-4957-9e42-225542e5c3fa	{"action":"user_updated_password","actor_id":"208d5d7b-98e5-48fd-9b60-7007da2e5561","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 12:18:48.860093+00	
00000000-0000-0000-0000-000000000000	ac7a8620-4c87-431d-aedd-73a1f4fe3625	{"action":"user_modified","actor_id":"208d5d7b-98e5-48fd-9b60-7007da2e5561","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 12:18:48.861757+00	
00000000-0000-0000-0000-000000000000	718b034d-eb81-488c-afc1-4ff25838784f	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 12:18:53.068723+00	
00000000-0000-0000-0000-000000000000	9ed60890-b8ca-4dc2-ba3a-1ff9bea0dd17	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 12:18:54.394779+00	
00000000-0000-0000-0000-000000000000	ba1f62be-9a8e-445b-ab93-6f8d74f3b470	{"action":"logout","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account"}	2025-09-05 12:21:50.132577+00	
00000000-0000-0000-0000-000000000000	db827af9-8422-49a8-b3bc-b3dabaa14ee0	{"action":"token_refreshed","actor_id":"ed1e771c-b068-4526-b5ce-60933d9a35ba","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 12:25:51.397589+00	
00000000-0000-0000-0000-000000000000	cfc49082-2b8e-403b-bf03-245b4705c5d0	{"action":"token_revoked","actor_id":"ed1e771c-b068-4526-b5ce-60933d9a35ba","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 12:25:51.399942+00	
00000000-0000-0000-0000-000000000000	392fff3d-06a6-4feb-aa97-55c6c2665057	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 12:26:32.187624+00	
00000000-0000-0000-0000-000000000000	2e6dbc4f-c41d-4a89-a96e-1306abff9c16	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"de507b3e-fc6c-4c25-a79b-f8645523b080","user_phone":""}}	2025-09-05 12:44:25.367134+00	
00000000-0000-0000-0000-000000000000	4223b092-7f4a-430d-a0c5-c77e6aaaf0d9	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"41069457-fd08-4028-875b-cb63fc076d13"}}	2025-09-05 12:44:52.303043+00	
00000000-0000-0000-0000-000000000000	12b1a0ef-fbe8-47e9-b30e-b1ae750bccf8	{"action":"user_signedup","actor_id":"41069457-fd08-4028-875b-cb63fc076d13","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 12:45:11.941533+00	
00000000-0000-0000-0000-000000000000	3267e32c-3a51-4cec-a019-8cf3bec500e2	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"41069457-fd08-4028-875b-cb63fc076d13","user_phone":""}}	2025-09-05 12:47:59.737567+00	
00000000-0000-0000-0000-000000000000	5f057a57-f9d8-4403-aa01-3969c1f1f990	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"d6325d99-ad6a-48ce-a8b8-49c3f192a083"}}	2025-09-05 12:53:09.960648+00	
00000000-0000-0000-0000-000000000000	f6fd9051-5a81-4e74-8d99-2cb32ae8bcd5	{"action":"user_signedup","actor_id":"d6325d99-ad6a-48ce-a8b8-49c3f192a083","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 12:53:30.119085+00	
00000000-0000-0000-0000-000000000000	879f2145-1929-475d-b0b9-af9ec712ac15	{"action":"user_updated_password","actor_id":"d6325d99-ad6a-48ce-a8b8-49c3f192a083","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 12:53:43.921198+00	
00000000-0000-0000-0000-000000000000	efe62ae1-0897-4622-aad8-cb62e8cf2651	{"action":"user_modified","actor_id":"d6325d99-ad6a-48ce-a8b8-49c3f192a083","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 12:53:43.922361+00	
00000000-0000-0000-0000-000000000000	01832e8a-18b8-4e5a-9010-2ec3d51506eb	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"d6325d99-ad6a-48ce-a8b8-49c3f192a083","user_phone":""}}	2025-09-05 13:06:48.865202+00	
00000000-0000-0000-0000-000000000000	dc223430-98a2-47b1-8fb0-0f062b9f29bf	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hussnainali50674@gmail.com","user_id":"208d5d7b-98e5-48fd-9b60-7007da2e5561","user_phone":""}}	2025-09-05 13:07:04.39558+00	
00000000-0000-0000-0000-000000000000	1ed2d965-02e6-4a06-81b2-1057d9bf4815	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"effectedars29@gmail.com","user_id":"ed1e771c-b068-4526-b5ce-60933d9a35ba","user_phone":""}}	2025-09-05 13:07:14.447081+00	
00000000-0000-0000-0000-000000000000	08a04827-6816-4336-b996-265f2477b261	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abdulrehman@sudostudy.com","user_id":"fb876868-680a-4d97-b287-90ea0d02c368","user_phone":""}}	2025-09-05 13:07:26.461863+00	
00000000-0000-0000-0000-000000000000	11108acc-5f5f-45a6-9535-361163b206bd	{"action":"logout","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account"}	2025-09-05 13:11:37.633368+00	
00000000-0000-0000-0000-000000000000	de3dd34f-f18a-46aa-8ff6-879173b5fe7f	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 13:16:46.337002+00	
00000000-0000-0000-0000-000000000000	2c0ce154-17af-48de-badb-1205d3e7804c	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abdulrehman@sudostudy.com","user_id":"1b3b4f50-df73-474f-bd18-7484f9e0b209"}}	2025-09-05 13:17:13.047155+00	
00000000-0000-0000-0000-000000000000	af1df184-ee25-44c6-aadf-48834feea522	{"action":"user_signedup","actor_id":"1b3b4f50-df73-474f-bd18-7484f9e0b209","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 13:17:58.435828+00	
00000000-0000-0000-0000-000000000000	7188ccda-86cf-4e4b-9b7d-47e638d60d13	{"action":"user_updated_password","actor_id":"1b3b4f50-df73-474f-bd18-7484f9e0b209","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 13:18:09.873173+00	
00000000-0000-0000-0000-000000000000	dc7d2305-ff56-4eba-96c8-9afc6adda56e	{"action":"user_modified","actor_id":"1b3b4f50-df73-474f-bd18-7484f9e0b209","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 13:18:09.874579+00	
00000000-0000-0000-0000-000000000000	d63fead7-1b8e-4634-bc88-1483224df81f	{"action":"logout","actor_id":"1b3b4f50-df73-474f-bd18-7484f9e0b209","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"account"}	2025-09-05 13:18:24.529251+00	
00000000-0000-0000-0000-000000000000	0bcd8015-b195-49ca-9b67-921dff752060	{"action":"login","actor_id":"1b3b4f50-df73-474f-bd18-7484f9e0b209","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 13:18:31.865139+00	
00000000-0000-0000-0000-000000000000	fd7abef9-c95f-4bb5-a5c6-b3cdfe687777	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"effectedars29@gmail.com","user_id":"7754d28c-1189-4ad1-8694-71cd0ee1ae66"}}	2025-09-05 13:19:45.717942+00	
00000000-0000-0000-0000-000000000000	310f9d7d-b015-4609-a09f-4096feb9dec5	{"action":"user_signedup","actor_id":"7754d28c-1189-4ad1-8694-71cd0ee1ae66","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 13:20:18.169573+00	
00000000-0000-0000-0000-000000000000	c3a5e66c-5071-41f2-be74-3d59877b3912	{"action":"user_updated_password","actor_id":"7754d28c-1189-4ad1-8694-71cd0ee1ae66","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 13:20:31.239454+00	
00000000-0000-0000-0000-000000000000	1d196221-053b-4cd2-9c4f-217f8ba8f8e8	{"action":"user_modified","actor_id":"7754d28c-1189-4ad1-8694-71cd0ee1ae66","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 13:20:31.240188+00	
00000000-0000-0000-0000-000000000000	27f1348f-c7ae-445e-896d-dfd6b1055f54	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"3b242ba6-d259-4f81-8fe9-a3c29039ba05"}}	2025-09-05 14:00:52.91375+00	
00000000-0000-0000-0000-000000000000	e8d004f7-3788-4c53-90fd-eab80fc96cd1	{"action":"user_signedup","actor_id":"3b242ba6-d259-4f81-8fe9-a3c29039ba05","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 14:01:21.070498+00	
00000000-0000-0000-0000-000000000000	28708c5e-520c-4c75-9b3e-1e4d621699fd	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"3b242ba6-d259-4f81-8fe9-a3c29039ba05","user_phone":""}}	2025-09-05 14:10:02.040684+00	
00000000-0000-0000-0000-000000000000	b7defe65-1426-4f50-8973-82addc29c8c2	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"48529b47-ca4c-41be-ba1f-1409d58f2c1c"}}	2025-09-05 14:11:07.602082+00	
00000000-0000-0000-0000-000000000000	a26645a1-46e5-475b-b140-5aadf02d4f9a	{"action":"user_signedup","actor_id":"48529b47-ca4c-41be-ba1f-1409d58f2c1c","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 14:11:22.095024+00	
00000000-0000-0000-0000-000000000000	4d5a6f32-785d-4b84-9146-ba2372bfe17b	{"action":"user_updated_password","actor_id":"48529b47-ca4c-41be-ba1f-1409d58f2c1c","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 14:11:55.94154+00	
00000000-0000-0000-0000-000000000000	db5947a7-a0e5-47fb-8d0f-6bdcb8359215	{"action":"user_modified","actor_id":"48529b47-ca4c-41be-ba1f-1409d58f2c1c","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 14:11:55.942196+00	
00000000-0000-0000-0000-000000000000	fb7921c4-00fd-4501-a606-5411b1140ea8	{"action":"logout","actor_id":"48529b47-ca4c-41be-ba1f-1409d58f2c1c","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-05 14:12:19.013988+00	
00000000-0000-0000-0000-000000000000	77fb7a8c-c12a-4e4c-a0d8-026997e96719	{"action":"login","actor_id":"48529b47-ca4c-41be-ba1f-1409d58f2c1c","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 14:12:28.929497+00	
00000000-0000-0000-0000-000000000000	fbec0715-e094-4601-a255-b36ced0d0e5a	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"48529b47-ca4c-41be-ba1f-1409d58f2c1c","user_phone":""}}	2025-09-05 14:13:03.380542+00	
00000000-0000-0000-0000-000000000000	045b848e-f82d-4123-b4be-839c24c1c609	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"5e6d5dfa-a0d6-4ba5-a56e-6a9d2d04d9e4"}}	2025-09-05 14:15:29.306827+00	
00000000-0000-0000-0000-000000000000	0ccbb46e-a494-483c-a190-e55f8bf008e8	{"action":"user_signedup","actor_id":"5e6d5dfa-a0d6-4ba5-a56e-6a9d2d04d9e4","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 14:15:44.727354+00	
00000000-0000-0000-0000-000000000000	74abdf80-939b-4715-9b7d-fc56b5b4732a	{"action":"token_refreshed","actor_id":"1b3b4f50-df73-474f-bd18-7484f9e0b209","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 14:16:42.301129+00	
00000000-0000-0000-0000-000000000000	3eb24a34-73c6-45f5-a34e-4ee6ade488c9	{"action":"token_revoked","actor_id":"1b3b4f50-df73-474f-bd18-7484f9e0b209","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 14:16:42.304223+00	
00000000-0000-0000-0000-000000000000	0dacef0a-7db5-4dac-a55b-da119ebd4e75	{"action":"user_updated_password","actor_id":"5e6d5dfa-a0d6-4ba5-a56e-6a9d2d04d9e4","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 14:16:50.019346+00	
00000000-0000-0000-0000-000000000000	3b14b9fb-63cd-494c-ba46-a4901bb59386	{"action":"user_modified","actor_id":"5e6d5dfa-a0d6-4ba5-a56e-6a9d2d04d9e4","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 14:16:50.020435+00	
00000000-0000-0000-0000-000000000000	6fa2dea9-8f1c-4e65-b94f-7a752dc4ff07	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hussnainali50674@gmail.com","user_id":"7ea4edad-c4c5-47d7-9e9d-c83f386cc623"}}	2025-09-05 14:29:04.962441+00	
00000000-0000-0000-0000-000000000000	ede71bc9-da70-4ed3-8f4f-b9cc3635cf14	{"action":"user_signedup","actor_id":"7ea4edad-c4c5-47d7-9e9d-c83f386cc623","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 14:29:23.997888+00	
00000000-0000-0000-0000-000000000000	a78292f2-0c9e-4093-8157-6fab8babed1e	{"action":"user_updated_password","actor_id":"7ea4edad-c4c5-47d7-9e9d-c83f386cc623","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 14:29:45.781706+00	
00000000-0000-0000-0000-000000000000	31d133b9-46bc-49f3-8a48-330e6fa001c4	{"action":"user_modified","actor_id":"7ea4edad-c4c5-47d7-9e9d-c83f386cc623","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 14:29:45.782868+00	
00000000-0000-0000-0000-000000000000	e68655bc-798d-4e29-986f-e6ee8ef809db	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 14:34:57.255295+00	
00000000-0000-0000-0000-000000000000	dea8015a-f8c5-42ac-92b8-b9f9e95a6e3f	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 14:34:57.263644+00	
00000000-0000-0000-0000-000000000000	ac65a13c-dfeb-45b2-bd92-671f89e2e98d	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"sudostudystudenttesting@gmail.com","user_id":"27fbf4cf-d473-4a9d-b0b7-adfdf69e6601"}}	2025-09-05 14:35:17.403406+00	
00000000-0000-0000-0000-000000000000	6fcf0fa3-4287-4704-babf-deb96d3d59be	{"action":"user_signedup","actor_id":"27fbf4cf-d473-4a9d-b0b7-adfdf69e6601","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 14:35:36.113415+00	
00000000-0000-0000-0000-000000000000	fdd5edb2-60e8-4556-9c68-7a3ed17098c8	{"action":"user_updated_password","actor_id":"27fbf4cf-d473-4a9d-b0b7-adfdf69e6601","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 14:35:49.342352+00	
00000000-0000-0000-0000-000000000000	57d1caa6-cab3-43c1-9aab-01be6ebe0030	{"action":"user_modified","actor_id":"27fbf4cf-d473-4a9d-b0b7-adfdf69e6601","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 14:35:49.343046+00	
00000000-0000-0000-0000-000000000000	ed7a0162-2f17-47db-b772-0bad95920098	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"shopifidev@gmail.com","user_id":"02976e3f-334f-4f99-9963-83893ba83124"}}	2025-09-05 14:37:00.53296+00	
00000000-0000-0000-0000-000000000000	cadfb3d1-aacd-4a58-ab67-99e9ae1d0177	{"action":"user_signedup","actor_id":"02976e3f-334f-4f99-9963-83893ba83124","actor_username":"shopifidev@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 14:37:51.00394+00	
00000000-0000-0000-0000-000000000000	aa05b888-98ef-40a6-bac8-09af9a135b1e	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"mibeve4942@cspaus.com","user_id":"3145b3a5-be73-4f5e-b135-0259e1aac975"}}	2025-09-05 14:40:19.793749+00	
00000000-0000-0000-0000-000000000000	1436a09e-a2c1-437d-91cc-a1513fa70dba	{"action":"user_signedup","actor_id":"3145b3a5-be73-4f5e-b135-0259e1aac975","actor_username":"mibeve4942@cspaus.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 14:40:40.94119+00	
00000000-0000-0000-0000-000000000000	cd8e0fce-60aa-4015-bb91-c2d2ead9d449	{"action":"user_updated_password","actor_id":"3145b3a5-be73-4f5e-b135-0259e1aac975","actor_username":"mibeve4942@cspaus.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 14:40:57.37132+00	
00000000-0000-0000-0000-000000000000	19c3cb11-f707-41a3-af8a-d8b3d2cbf140	{"action":"user_modified","actor_id":"3145b3a5-be73-4f5e-b135-0259e1aac975","actor_username":"mibeve4942@cspaus.com","actor_via_sso":false,"log_type":"user"}	2025-09-05 14:40:57.372415+00	
00000000-0000-0000-0000-000000000000	8e6a7ff2-7aee-4d65-9e5b-82ed373367de	{"action":"token_refreshed","actor_id":"7ea4edad-c4c5-47d7-9e9d-c83f386cc623","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 05:35:38.087205+00	
00000000-0000-0000-0000-000000000000	37036da8-5f07-4933-8cef-63572e6f0b2f	{"action":"token_revoked","actor_id":"7ea4edad-c4c5-47d7-9e9d-c83f386cc623","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 05:35:38.101357+00	
00000000-0000-0000-0000-000000000000	847e1e76-fc55-414d-a26d-20be2dba198b	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hussnainali50674@gmail.com","user_id":"7ea4edad-c4c5-47d7-9e9d-c83f386cc623","user_phone":""}}	2025-09-08 05:37:40.060962+00	
00000000-0000-0000-0000-000000000000	43e65b10-e778-473c-a07d-219e5cd51372	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"sudostudystudenttesting@gmail.com","user_id":"27fbf4cf-d473-4a9d-b0b7-adfdf69e6601","user_phone":""}}	2025-09-08 05:42:23.488795+00	
00000000-0000-0000-0000-000000000000	039bcd16-0c4f-4443-8bf5-49d23fc0c453	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 05:42:36.747739+00	
00000000-0000-0000-0000-000000000000	94767feb-3ac1-4364-8e78-9153092c6b6b	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 05:42:36.748385+00	
00000000-0000-0000-0000-000000000000	1f96501f-5b87-4ea7-8be1-30221cf6921a	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"sudostudystudenttesting@gmail.com","user_id":"9935eef0-0f63-42ae-b356-9fb74e4cf9d1"}}	2025-09-08 05:52:02.207623+00	
00000000-0000-0000-0000-000000000000	830e4f34-7e47-4f85-b302-182ce1d01381	{"action":"user_signedup","actor_id":"9935eef0-0f63-42ae-b356-9fb74e4cf9d1","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-08 05:52:36.949391+00	
00000000-0000-0000-0000-000000000000	c9e61a91-7e4d-4a21-8505-0c4261a24a5b	{"action":"user_updated_password","actor_id":"9935eef0-0f63-42ae-b356-9fb74e4cf9d1","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-08 05:52:53.525975+00	
00000000-0000-0000-0000-000000000000	6186b4e0-5ccc-474b-93da-67ddb7c015e8	{"action":"user_modified","actor_id":"9935eef0-0f63-42ae-b356-9fb74e4cf9d1","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-08 05:52:53.527874+00	
00000000-0000-0000-0000-000000000000	0cdb4ed7-4427-4421-bd96-d0337225de2b	{"action":"logout","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account"}	2025-09-08 06:01:06.529298+00	
00000000-0000-0000-0000-000000000000	0fefe54f-8003-466f-87e1-48e295eb9c42	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 06:04:19.99085+00	
00000000-0000-0000-0000-000000000000	904d2668-f673-4b6d-beb4-d7c4ea864d4b	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 06:08:20.498412+00	
00000000-0000-0000-0000-000000000000	61eabc5d-c5ce-451f-b75f-244e488514cd	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 06:53:53.33134+00	
00000000-0000-0000-0000-000000000000	2d92ef0b-e0c1-43a8-b2b4-81cb64b3d5b1	{"action":"token_refreshed","actor_id":"9935eef0-0f63-42ae-b356-9fb74e4cf9d1","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 07:04:04.808306+00	
00000000-0000-0000-0000-000000000000	d8fad899-7a98-4d1e-a78d-ad272b4d5f58	{"action":"token_revoked","actor_id":"9935eef0-0f63-42ae-b356-9fb74e4cf9d1","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 07:04:04.819847+00	
00000000-0000-0000-0000-000000000000	10a5761a-fe85-4eea-af53-dfdcb628185b	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hussnainali50674@gmail.com","user_id":"32ac68bd-73a3-436a-b596-acbce12515f0"}}	2025-09-08 07:04:40.743462+00	
00000000-0000-0000-0000-000000000000	af44597f-4743-472e-93bd-31dcc0f76ac9	{"action":"user_signedup","actor_id":"32ac68bd-73a3-436a-b596-acbce12515f0","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-08 07:05:18.110507+00	
00000000-0000-0000-0000-000000000000	24a2f3d9-da70-47a9-8047-6ca78bbbe256	{"action":"user_updated_password","actor_id":"32ac68bd-73a3-436a-b596-acbce12515f0","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-08 07:05:29.161718+00	
00000000-0000-0000-0000-000000000000	cbd90df5-75b5-4e5d-9067-25fe147d166c	{"action":"user_modified","actor_id":"32ac68bd-73a3-436a-b596-acbce12515f0","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-08 07:05:29.162852+00	
00000000-0000-0000-0000-000000000000	05f4edf8-18b6-43ec-9361-84280d94d182	{"action":"token_refreshed","actor_id":"9935eef0-0f63-42ae-b356-9fb74e4cf9d1","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 08:02:04.970967+00	
00000000-0000-0000-0000-000000000000	ac046d86-6434-4137-bb91-6ec3ede3caf4	{"action":"token_revoked","actor_id":"9935eef0-0f63-42ae-b356-9fb74e4cf9d1","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 08:02:04.997387+00	
00000000-0000-0000-0000-000000000000	1a73bab4-f2c7-454d-a863-d03dfcca5c49	{"action":"token_refreshed","actor_id":"32ac68bd-73a3-436a-b596-acbce12515f0","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 08:03:21.12132+00	
00000000-0000-0000-0000-000000000000	5b724018-fb77-4a7f-b765-524951c0c3f5	{"action":"token_revoked","actor_id":"32ac68bd-73a3-436a-b596-acbce12515f0","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 08:03:21.128516+00	
00000000-0000-0000-0000-000000000000	c71f30b0-8ba3-4cf1-a338-3807046d6709	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 08:25:23.791585+00	
00000000-0000-0000-0000-000000000000	c51e09db-be84-4338-9e48-5d75f9e11d94	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 08:25:23.795786+00	
00000000-0000-0000-0000-000000000000	dcd9c6b2-04ee-498d-bb8e-2a84efcae617	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"sudostudystudenttesting@gmail.com","user_id":"9935eef0-0f63-42ae-b356-9fb74e4cf9d1","user_phone":""}}	2025-09-08 08:27:59.916789+00	
00000000-0000-0000-0000-000000000000	5396eecc-ca9c-4d54-8221-506daa69fb79	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hussnainali50674@gmail.com","user_id":"32ac68bd-73a3-436a-b596-acbce12515f0","user_phone":""}}	2025-09-08 08:28:00.042991+00	
00000000-0000-0000-0000-000000000000	abb5c4f7-0baa-4bec-b128-92b83700f6a0	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 09:52:21.781183+00	
00000000-0000-0000-0000-000000000000	b1cf8bdb-b789-4ed5-9c2d-8586bbda3471	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 09:52:21.802651+00	
00000000-0000-0000-0000-000000000000	2c77f749-ff2c-4d28-819c-a09ffd9f6b60	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 09:53:12.275358+00	
00000000-0000-0000-0000-000000000000	d266b41f-e229-4bf3-a959-217577885c4c	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"sudostudystudenttesting@gmail.com","user_id":"e96aff59-cefc-43f0-a87a-781aab2fc24a"}}	2025-09-08 10:02:20.887645+00	
00000000-0000-0000-0000-000000000000	e8dbef96-85cd-4802-9a2b-b72b91f314ea	{"action":"user_signedup","actor_id":"e96aff59-cefc-43f0-a87a-781aab2fc24a","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-08 10:02:43.379347+00	
00000000-0000-0000-0000-000000000000	2c42865d-08bc-4711-a527-e8afe084d063	{"action":"user_updated_password","actor_id":"e96aff59-cefc-43f0-a87a-781aab2fc24a","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-08 10:02:56.248431+00	
00000000-0000-0000-0000-000000000000	8925772a-5322-4cbc-bc4c-57a0866c4057	{"action":"user_modified","actor_id":"e96aff59-cefc-43f0-a87a-781aab2fc24a","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-08 10:02:56.249949+00	
00000000-0000-0000-0000-000000000000	14c4c61f-a877-4741-ba37-23d76ad42d3d	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hussnainali50674@gmail.com","user_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63"}}	2025-09-08 10:03:24.339762+00	
00000000-0000-0000-0000-000000000000	918be60d-cad0-4e46-a705-9875fb103170	{"action":"user_signedup","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-08 10:04:05.710917+00	
00000000-0000-0000-0000-000000000000	81ad053c-f651-4388-9cc2-2d0670d4baa3	{"action":"user_updated_password","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-08 10:04:16.819917+00	
00000000-0000-0000-0000-000000000000	0564b0f3-88dc-4360-a23e-b7b63a108b82	{"action":"user_modified","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-08 10:04:16.822507+00	
00000000-0000-0000-0000-000000000000	75fa9561-1210-4447-95da-b17001b757f0	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 10:54:56.739332+00	
00000000-0000-0000-0000-000000000000	9dce061a-1891-4a30-8054-270f0becc8d6	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 10:54:56.763507+00	
00000000-0000-0000-0000-000000000000	0f4bf2e9-4523-46ca-b103-f632061c5b4b	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 11:53:21.195437+00	
00000000-0000-0000-0000-000000000000	60e6b6b0-de2c-4e49-aa59-e946a9eee1ea	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 11:53:21.217857+00	
00000000-0000-0000-0000-000000000000	7a2d37df-eb54-43da-8817-0a82c3a62d6e	{"action":"token_refreshed","actor_id":"e96aff59-cefc-43f0-a87a-781aab2fc24a","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 12:01:48.770886+00	
00000000-0000-0000-0000-000000000000	58ff22c5-eaf9-47da-8e0f-bb3d828cfa9c	{"action":"token_revoked","actor_id":"e96aff59-cefc-43f0-a87a-781aab2fc24a","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 12:01:48.778134+00	
00000000-0000-0000-0000-000000000000	bb951213-bc04-459e-aa0e-23676c967441	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"effectedars29@gmail.com","user_id":"7754d28c-1189-4ad1-8694-71cd0ee1ae66","user_phone":""}}	2025-09-08 12:10:37.723412+00	
00000000-0000-0000-0000-000000000000	aaac35e3-9f80-496c-9b41-ee913dea671f	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"5e6d5dfa-a0d6-4ba5-a56e-6a9d2d04d9e4","user_phone":""}}	2025-09-08 12:10:37.745265+00	
00000000-0000-0000-0000-000000000000	fc679d53-be91-4ba2-8d96-59f49bdfe3ac	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 12:11:45.662545+00	
00000000-0000-0000-0000-000000000000	ab62151c-fed8-4b31-9995-4364add1fd01	{"action":"logout","actor_id":"e96aff59-cefc-43f0-a87a-781aab2fc24a","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-08 12:29:39.890499+00	
00000000-0000-0000-0000-000000000000	dde2b51e-670e-4dd7-866b-249eb090adff	{"action":"login","actor_id":"e96aff59-cefc-43f0-a87a-781aab2fc24a","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 12:30:06.485536+00	
00000000-0000-0000-0000-000000000000	b54caf06-e283-44c8-b9d7-733fdd1feccb	{"action":"logout","actor_id":"e96aff59-cefc-43f0-a87a-781aab2fc24a","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-08 12:30:09.227542+00	
00000000-0000-0000-0000-000000000000	1adb7ed6-9eb8-4b98-815e-75fac174093c	{"action":"login","actor_id":"e96aff59-cefc-43f0-a87a-781aab2fc24a","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 12:30:54.658339+00	
00000000-0000-0000-0000-000000000000	9963453b-8c27-45ea-98c4-bdcbf5569e63	{"action":"token_refreshed","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 12:59:12.258258+00	
00000000-0000-0000-0000-000000000000	60993649-7fb0-4b55-9b5b-1bd34d251ffa	{"action":"token_revoked","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 12:59:12.275116+00	
00000000-0000-0000-0000-000000000000	a54122a7-0b04-436c-9d5a-c04042a24ebf	{"action":"logout","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-08 12:59:39.755886+00	
00000000-0000-0000-0000-000000000000	67fb9546-2291-4f45-bf1e-5fe81b91d6ff	{"action":"login","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 13:04:33.883666+00	
00000000-0000-0000-0000-000000000000	e974954e-16b9-4a0c-b500-59791f23e3a4	{"action":"logout","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-08 13:04:35.936266+00	
00000000-0000-0000-0000-000000000000	ec46e2ab-388c-4419-af3d-135644411e8d	{"action":"login","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 13:16:03.984551+00	
00000000-0000-0000-0000-000000000000	2a0c57c0-2acb-4d6d-a868-3db8cbd51d23	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 13:16:28.778201+00	
00000000-0000-0000-0000-000000000000	362643da-9e53-4a31-a3ca-8295864b0dc1	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 13:16:28.779983+00	
00000000-0000-0000-0000-000000000000	dfa6d6b6-57da-49e1-85c8-c9a9e88a9e83	{"action":"logout","actor_id":"e96aff59-cefc-43f0-a87a-781aab2fc24a","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-08 13:16:40.222856+00	
00000000-0000-0000-0000-000000000000	d3766d77-f2c0-43e5-8201-0dadf5667204	{"action":"logout","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-08 13:16:48.678443+00	
00000000-0000-0000-0000-000000000000	950bdff5-a65c-40e7-839b-74195c0e9845	{"action":"login","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 13:17:37.909612+00	
00000000-0000-0000-0000-000000000000	ca40a875-51fa-4bb2-a419-6ada5f49290c	{"action":"login","actor_id":"e96aff59-cefc-43f0-a87a-781aab2fc24a","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 13:17:59.648656+00	
00000000-0000-0000-0000-000000000000	800429bf-33a8-4eaa-8c88-c44d1de45653	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"effectedars29@gmail.com","user_id":"b851457d-8e99-4ea4-92d0-f607c1a95ba6"}}	2025-09-08 13:18:35.029312+00	
00000000-0000-0000-0000-000000000000	30176cf9-be5d-4621-8ff9-212378f15d21	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"effectedars29@gmail.com","user_id":"b851457d-8e99-4ea4-92d0-f607c1a95ba6","user_phone":""}}	2025-09-08 13:18:57.0116+00	
00000000-0000-0000-0000-000000000000	f4d87dcc-74c2-4ab1-81cc-cece0bbc2fdb	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"effectedars29@gmail.com","user_id":"a9f74fc1-050e-407e-84bc-aee3d2f0d1de"}}	2025-09-08 13:20:01.474199+00	
00000000-0000-0000-0000-000000000000	a27f32b3-e4dd-4699-b13a-2087ce4e98d3	{"action":"user_signedup","actor_id":"a9f74fc1-050e-407e-84bc-aee3d2f0d1de","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-08 13:20:28.030722+00	
00000000-0000-0000-0000-000000000000	ab332f74-35fe-4cd8-acf5-0b0a6b723ffe	{"action":"user_updated_password","actor_id":"a9f74fc1-050e-407e-84bc-aee3d2f0d1de","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-08 13:20:44.173161+00	
00000000-0000-0000-0000-000000000000	81ddf281-a0b1-4514-a147-235019c5156f	{"action":"user_modified","actor_id":"a9f74fc1-050e-407e-84bc-aee3d2f0d1de","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-08 13:20:44.174248+00	
00000000-0000-0000-0000-000000000000	43d1242d-73fd-4c52-8f8c-265fc76d796f	{"action":"token_refreshed","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 07:30:34.852736+00	
00000000-0000-0000-0000-000000000000	d89d4506-e8c4-40f8-ac1e-ff07b29558b6	{"action":"token_revoked","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 07:30:34.866714+00	
00000000-0000-0000-0000-000000000000	25ff101a-e95d-4288-b372-9166a72e86d6	{"action":"token_refreshed","actor_id":"a9f74fc1-050e-407e-84bc-aee3d2f0d1de","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 07:31:11.871201+00	
00000000-0000-0000-0000-000000000000	1917da96-76b8-4d34-97df-b203d7bde96b	{"action":"token_revoked","actor_id":"a9f74fc1-050e-407e-84bc-aee3d2f0d1de","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 07:31:11.888976+00	
00000000-0000-0000-0000-000000000000	26902a8e-26e3-47d2-8eeb-1ff371ea0aa8	{"action":"token_refreshed","actor_id":"e96aff59-cefc-43f0-a87a-781aab2fc24a","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 07:32:50.45746+00	
00000000-0000-0000-0000-000000000000	1a54ad5c-4f9c-4175-824f-3994f90e1c03	{"action":"token_revoked","actor_id":"e96aff59-cefc-43f0-a87a-781aab2fc24a","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 07:32:50.463181+00	
00000000-0000-0000-0000-000000000000	8ae06e40-6b52-48f8-8672-ee247ea0aefa	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"73aba80e-dddf-4b16-8d85-07a5af75a0ef"}}	2025-09-10 07:34:31.924055+00	
00000000-0000-0000-0000-000000000000	75fb775c-14b7-4896-8e96-03912aadb3ce	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"73aba80e-dddf-4b16-8d85-07a5af75a0ef"}}	2025-09-10 07:44:44.824209+00	
00000000-0000-0000-0000-000000000000	71e69664-565a-4203-a9dd-3fc20bf6ec64	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"73aba80e-dddf-4b16-8d85-07a5af75a0ef","user_phone":""}}	2025-09-10 07:45:29.008868+00	
00000000-0000-0000-0000-000000000000	6d85ef96-0f96-461c-82c3-d83f8f5d454f	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"29a6aa36-1c24-4db5-950c-a1b410a32e26"}}	2025-09-10 07:45:46.517538+00	
00000000-0000-0000-0000-000000000000	02060868-e487-4422-933a-af1c25272158	{"action":"user_signedup","actor_id":"29a6aa36-1c24-4db5-950c-a1b410a32e26","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-10 07:46:15.145827+00	
00000000-0000-0000-0000-000000000000	30c95edb-c67f-4a5a-ac52-c24d1b95b92f	{"action":"user_updated_password","actor_id":"29a6aa36-1c24-4db5-950c-a1b410a32e26","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-10 07:46:28.350437+00	
00000000-0000-0000-0000-000000000000	844417b3-e7d4-497d-8d8d-2942ed50dfe4	{"action":"user_modified","actor_id":"29a6aa36-1c24-4db5-950c-a1b410a32e26","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-10 07:46:28.352028+00	
00000000-0000-0000-0000-000000000000	0a14ff7d-e53b-43fd-90ac-732f0bb500f0	{"action":"logout","actor_id":"29a6aa36-1c24-4db5-950c-a1b410a32e26","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 07:47:10.701802+00	
00000000-0000-0000-0000-000000000000	76a90131-780f-40e7-9d1d-f6e44e53717d	{"action":"login","actor_id":"29a6aa36-1c24-4db5-950c-a1b410a32e26","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 07:47:22.8517+00	
00000000-0000-0000-0000-000000000000	8d381c8e-df6a-4593-b7e0-6f21c1cf1f2d	{"action":"logout","actor_id":"29a6aa36-1c24-4db5-950c-a1b410a32e26","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 07:47:24.64797+00	
00000000-0000-0000-0000-000000000000	a9e35ab4-c278-4769-8efa-e8d167945847	{"action":"login","actor_id":"29a6aa36-1c24-4db5-950c-a1b410a32e26","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 07:47:51.497296+00	
00000000-0000-0000-0000-000000000000	849ddc7a-319a-4fe4-bd14-48396c0c142c	{"action":"token_refreshed","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 08:28:36.42521+00	
00000000-0000-0000-0000-000000000000	8b34c1fc-ba67-487e-9bd8-d42953b6668f	{"action":"token_revoked","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 08:28:36.445432+00	
00000000-0000-0000-0000-000000000000	ee53ff5a-4540-44c4-83a6-76a43938fd2b	{"action":"token_refreshed","actor_id":"a9f74fc1-050e-407e-84bc-aee3d2f0d1de","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 08:58:08.035959+00	
00000000-0000-0000-0000-000000000000	ef443057-cb85-4556-99eb-bfedd7dcd736	{"action":"token_revoked","actor_id":"a9f74fc1-050e-407e-84bc-aee3d2f0d1de","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 08:58:08.051749+00	
00000000-0000-0000-0000-000000000000	6b9a1ecf-7132-47c0-a03f-0390977bcf3a	{"action":"token_refreshed","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 09:33:19.660544+00	
00000000-0000-0000-0000-000000000000	6d73c43b-c9fe-4ce0-985c-90bcb0850b70	{"action":"token_revoked","actor_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 09:33:19.667317+00	
00000000-0000-0000-0000-000000000000	a806395b-8489-4e27-b9d2-b9b1cc5209d1	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hussnainali50674@gmail.com","user_id":"4b952612-4a16-47cb-a2c3-f6da97f39a63","user_phone":""}}	2025-09-10 09:35:51.604067+00	
00000000-0000-0000-0000-000000000000	97da3c44-91c0-403e-925a-e416da97654b	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"sudostudystudenttesting@gmail.com","user_id":"e96aff59-cefc-43f0-a87a-781aab2fc24a","user_phone":""}}	2025-09-10 09:35:51.631553+00	
00000000-0000-0000-0000-000000000000	0d086a44-d66f-4bc2-83da-b8dc2cdfc2fc	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 09:36:05.727662+00	
00000000-0000-0000-0000-000000000000	95740ce3-9057-4483-9c7c-9396278d70d1	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 09:36:05.728709+00	
00000000-0000-0000-0000-000000000000	5cf15578-864d-4922-a4c5-91466ed48bc2	{"action":"login","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 09:37:49.915139+00	
00000000-0000-0000-0000-000000000000	e28a8cb4-59a0-490e-b316-1e09938446d7	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"sudostudystudenttesting@gmail.com","user_id":"c0a6b300-9bbb-45a1-ade1-40e4126bae8b"}}	2025-09-10 09:38:44.427556+00	
00000000-0000-0000-0000-000000000000	7076f385-4dc3-4115-8713-1b0d538c8fe5	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"sudostudystudenttesting@gmail.com","user_id":"c0a6b300-9bbb-45a1-ade1-40e4126bae8b","user_phone":""}}	2025-09-10 09:39:29.101545+00	
00000000-0000-0000-0000-000000000000	4e7839c7-74d1-4163-aa5c-196088707382	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"sudostudystudenttesting@gmail.com","user_id":"a76ded16-86fc-4fbb-b7d8-ed6399ce8910"}}	2025-09-10 09:39:41.874495+00	
00000000-0000-0000-0000-000000000000	6f88a759-2244-400e-94e8-1f4b7d346583	{"action":"user_signedup","actor_id":"a76ded16-86fc-4fbb-b7d8-ed6399ce8910","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-10 09:40:25.028254+00	
00000000-0000-0000-0000-000000000000	32c75edb-d4e3-4ca5-ad64-866e41d79241	{"action":"user_updated_password","actor_id":"a76ded16-86fc-4fbb-b7d8-ed6399ce8910","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-10 09:40:36.802419+00	
00000000-0000-0000-0000-000000000000	061f6706-b26a-43a9-94c6-c1ea7e046935	{"action":"user_modified","actor_id":"a76ded16-86fc-4fbb-b7d8-ed6399ce8910","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-10 09:40:36.803112+00	
00000000-0000-0000-0000-000000000000	5f92a43f-275e-4e5c-b1e5-6f426b96acdd	{"action":"logout","actor_id":"a76ded16-86fc-4fbb-b7d8-ed6399ce8910","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 09:41:18.309306+00	
00000000-0000-0000-0000-000000000000	fb4115b0-d331-4317-ab93-ecd9478c3546	{"action":"login","actor_id":"a76ded16-86fc-4fbb-b7d8-ed6399ce8910","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 09:41:48.385548+00	
00000000-0000-0000-0000-000000000000	963cda33-7689-45cc-8495-dd38d207d491	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hussnainali50674@gmail.com","user_id":"1130c5d9-96f3-400d-b34e-b66662e7f0bf"}}	2025-09-10 09:43:06.783014+00	
00000000-0000-0000-0000-000000000000	d74f8957-ff05-491e-b560-2da5c374b09e	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hussnainali50674@gmail.com","user_id":"1130c5d9-96f3-400d-b34e-b66662e7f0bf","user_phone":""}}	2025-09-10 09:43:44.982013+00	
00000000-0000-0000-0000-000000000000	48163678-af32-4337-b1d2-e7c75f320a84	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hussnainali50674@gmail.com","user_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9"}}	2025-09-10 09:43:58.825292+00	
00000000-0000-0000-0000-000000000000	a6e970c6-6f6d-408d-88a8-7366b09707fb	{"action":"user_signedup","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-10 09:44:29.768451+00	
00000000-0000-0000-0000-000000000000	e5ca767b-2ee4-455a-b7a2-42fb6cf6f794	{"action":"user_updated_password","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-10 09:44:41.434849+00	
00000000-0000-0000-0000-000000000000	debb9d05-8bc8-495a-bc35-68d22d5a524d	{"action":"user_modified","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-09-10 09:44:41.436424+00	
00000000-0000-0000-0000-000000000000	90c45402-0fb7-42a8-9f10-6376a9f1c59f	{"action":"logout","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 09:45:42.315521+00	
00000000-0000-0000-0000-000000000000	af159368-9606-4962-bef6-afd1738762b6	{"action":"login","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 09:46:23.553663+00	
00000000-0000-0000-0000-000000000000	e40d8e6e-cbab-48e9-b501-dc645c5c101e	{"action":"logout","actor_id":"a76ded16-86fc-4fbb-b7d8-ed6399ce8910","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 09:46:56.541082+00	
00000000-0000-0000-0000-000000000000	f341cd69-c35c-4778-ab7d-e58e9bcbe638	{"action":"logout","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 09:47:04.567362+00	
00000000-0000-0000-0000-000000000000	ebb9788a-a0b5-47f1-a4f0-76fa3fe6a969	{"action":"login","actor_id":"a76ded16-86fc-4fbb-b7d8-ed6399ce8910","actor_username":"sudostudystudenttesting@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 09:47:30.302363+00	
00000000-0000-0000-0000-000000000000	dc7897d6-ee12-4d79-a83b-b823debe6b8a	{"action":"login","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 09:48:08.561845+00	
00000000-0000-0000-0000-000000000000	8dab7a67-826c-47c6-8cea-2166145d4b22	{"action":"login","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 10:08:27.866936+00	
00000000-0000-0000-0000-000000000000	39d170c2-7b86-4b02-a4cb-b2a21d2e3ed6	{"action":"login","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 10:09:45.754665+00	
00000000-0000-0000-0000-000000000000	c767b09c-60d4-4178-8e78-703b16c3d998	{"action":"token_refreshed","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 11:08:11.751032+00	
00000000-0000-0000-0000-000000000000	d81f5c24-02c2-4962-a28a-5fb195b2b56c	{"action":"token_revoked","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 11:08:11.76543+00	
00000000-0000-0000-0000-000000000000	0fef353c-d08f-4db3-940c-681c1d2101e9	{"action":"token_refreshed","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 07:49:11.263034+00	
00000000-0000-0000-0000-000000000000	f6baee0d-90a7-4df6-802c-120c7a499070	{"action":"token_revoked","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 07:49:11.289576+00	
00000000-0000-0000-0000-000000000000	751304a4-d7ad-40e3-93b2-d98989de31e1	{"action":"token_refreshed","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 08:47:47.408503+00	
00000000-0000-0000-0000-000000000000	fecaa8c9-70a7-4b01-92fc-b5d8bd78c14d	{"action":"token_revoked","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 08:47:47.434352+00	
00000000-0000-0000-0000-000000000000	1800361a-37b3-4fbd-b5d1-4fe6b2499ad1	{"action":"token_refreshed","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 09:46:47.491035+00	
00000000-0000-0000-0000-000000000000	d14383aa-f998-4722-9da3-cb4e8a41da04	{"action":"token_revoked","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 09:46:47.508325+00	
00000000-0000-0000-0000-000000000000	2f745dc0-ab18-4fce-bacc-e8e107347928	{"action":"token_refreshed","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 10:45:26.457427+00	
00000000-0000-0000-0000-000000000000	eb11118f-03ad-48cb-b3f6-fd1ca5780871	{"action":"token_revoked","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 10:45:26.474852+00	
00000000-0000-0000-0000-000000000000	da818537-f75e-4efd-88f2-b7dc062b8bf5	{"action":"token_refreshed","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 11:43:46.589354+00	
00000000-0000-0000-0000-000000000000	b92616ff-afe1-4c38-b222-88b232f74767	{"action":"token_revoked","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 11:43:46.60884+00	
00000000-0000-0000-0000-000000000000	1079068e-8549-49a1-9be6-9d5a50cc013c	{"action":"token_refreshed","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 12:42:11.228409+00	
00000000-0000-0000-0000-000000000000	a810e061-7d7a-4329-bd28-ae4c08406de9	{"action":"token_revoked","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 12:42:11.239972+00	
00000000-0000-0000-0000-000000000000	bd1197c9-ce70-40a0-ad6d-ec9c83443d4e	{"action":"token_refreshed","actor_id":"a9f74fc1-050e-407e-84bc-aee3d2f0d1de","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 12:56:18.617837+00	
00000000-0000-0000-0000-000000000000	b10db662-4d43-4819-9f0c-41799e996cc0	{"action":"token_revoked","actor_id":"a9f74fc1-050e-407e-84bc-aee3d2f0d1de","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 12:56:18.631264+00	
00000000-0000-0000-0000-000000000000	2368a384-8c82-4a63-9ecb-47af26e2bb70	{"action":"token_refreshed","actor_id":"29a6aa36-1c24-4db5-950c-a1b410a32e26","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 13:36:07.811405+00	
00000000-0000-0000-0000-000000000000	8010095d-f81d-4def-82f2-ea91c0ea062f	{"action":"token_revoked","actor_id":"29a6aa36-1c24-4db5-950c-a1b410a32e26","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 13:36:07.82529+00	
00000000-0000-0000-0000-000000000000	7d509336-5bc1-4610-a2f3-715bcbdc8e7a	{"action":"login","actor_id":"29a6aa36-1c24-4db5-950c-a1b410a32e26","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 13:36:45.9405+00	
00000000-0000-0000-0000-000000000000	82789808-cb58-45d0-841c-afefd1accd1e	{"action":"login","actor_id":"29a6aa36-1c24-4db5-950c-a1b410a32e26","actor_username":"cic1d133o1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 13:38:03.879458+00	
00000000-0000-0000-0000-000000000000	945ceaa6-831a-44e9-a2ba-5bc1985c0ea2	{"action":"token_refreshed","actor_id":"a9f74fc1-050e-407e-84bc-aee3d2f0d1de","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 14:00:09.122221+00	
00000000-0000-0000-0000-000000000000	c01cf80b-1b86-4900-a342-0985c30a739c	{"action":"token_revoked","actor_id":"a9f74fc1-050e-407e-84bc-aee3d2f0d1de","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 14:00:09.128478+00	
00000000-0000-0000-0000-000000000000	88120517-8b2c-45b7-9eff-7d7aacb39e7a	{"action":"token_refreshed","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 10:11:04.583634+00	
00000000-0000-0000-0000-000000000000	7dbdcb45-040c-4443-a244-cef5e91ac3f1	{"action":"token_revoked","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 10:11:04.607827+00	
00000000-0000-0000-0000-000000000000	edb01359-5149-4e9a-9cf3-bb6e2731707e	{"action":"login","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 10:12:19.08728+00	
00000000-0000-0000-0000-000000000000	c34c00b0-070a-450d-a8f2-94212ab62d1c	{"action":"login","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 10:13:31.684029+00	
00000000-0000-0000-0000-000000000000	db442a2c-f3d4-4dcd-be08-796039abdc79	{"action":"token_refreshed","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 11:11:47.11377+00	
00000000-0000-0000-0000-000000000000	f8e80695-d0ee-42c9-b5b5-a1325e71163a	{"action":"token_revoked","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 11:11:47.133581+00	
00000000-0000-0000-0000-000000000000	fac4e0b8-acc4-4366-9900-f741fbf5dab6	{"action":"token_refreshed","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 12:10:09.519024+00	
00000000-0000-0000-0000-000000000000	cb17a9f8-fbb6-49a1-814b-2e39fcff5146	{"action":"token_revoked","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 12:10:09.542326+00	
00000000-0000-0000-0000-000000000000	c1964350-a4df-4d3a-9a7b-5d7eca687069	{"action":"token_refreshed","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 13:08:45.58882+00	
00000000-0000-0000-0000-000000000000	c8f295a5-05c0-4fba-a75d-95fab006f2be	{"action":"token_revoked","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 13:08:45.604434+00	
00000000-0000-0000-0000-000000000000	db76f040-8e30-44e7-8535-ff4a3f0eea77	{"action":"token_refreshed","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 14:10:02.812638+00	
00000000-0000-0000-0000-000000000000	873f82ba-c0da-488c-9362-51ffebc0e7fb	{"action":"token_revoked","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 14:10:02.828753+00	
00000000-0000-0000-0000-000000000000	36babc31-2fca-4b74-a24e-82a80b484479	{"action":"token_refreshed","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 13:58:50.655268+00	
00000000-0000-0000-0000-000000000000	0b48a443-f5c2-4b80-8afd-689405ec9013	{"action":"token_revoked","actor_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 13:58:50.690743+00	
00000000-0000-0000-0000-000000000000	0e41a6b0-e49e-434c-aa0b-43f7beb7a904	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"shopifidev@gmail.com","user_id":"02976e3f-334f-4f99-9963-83893ba83124","user_phone":""}}	2025-10-23 11:59:11.062903+00	
00000000-0000-0000-0000-000000000000	e14297de-d8c0-45f8-b544-bf0ebd9fdc28	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abdulrehman@sudostudy.com","user_id":"1b3b4f50-df73-474f-bd18-7484f9e0b209","user_phone":""}}	2025-10-23 11:59:11.064104+00	
00000000-0000-0000-0000-000000000000	86974dbc-f0e2-47a7-9597-472c8925458c	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"cic1d133o1@gmail.com","user_id":"29a6aa36-1c24-4db5-950c-a1b410a32e26","user_phone":""}}	2025-10-23 11:59:11.06345+00	
00000000-0000-0000-0000-000000000000	1c337097-7f1e-4bae-80e3-5730bc118fe0	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"mibeve4942@cspaus.com","user_id":"3145b3a5-be73-4f5e-b135-0259e1aac975","user_phone":""}}	2025-10-23 11:59:11.146261+00	
00000000-0000-0000-0000-000000000000	4cc097c0-3281-40d5-8706-357628e13641	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hussnainali50674@gmail.com","user_id":"35e32fc9-16fc-4c56-badc-c758d4befcc9","user_phone":""}}	2025-10-23 11:59:11.37285+00	
00000000-0000-0000-0000-000000000000	ce618ac4-ec22-481a-b32a-4dbf1bb0b539	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"effectedars29@gmail.com","user_id":"a9f74fc1-050e-407e-84bc-aee3d2f0d1de","user_phone":""}}	2025-10-23 11:59:11.387912+00	
00000000-0000-0000-0000-000000000000	e4e65255-f226-47e3-a8e8-463fafcb06d5	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 20:50:09.385376+00	
00000000-0000-0000-0000-000000000000	33b8e12d-890a-4a97-a035-99916446136a	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 20:50:09.408427+00	
00000000-0000-0000-0000-000000000000	de1dd151-fb95-4bfe-bdb6-21c2fed4964b	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 21:48:27.350979+00	
00000000-0000-0000-0000-000000000000	ff86b1f3-0cea-4fe0-ac25-98ec38062fe9	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 21:48:27.370113+00	
00000000-0000-0000-0000-000000000000	f1a017f0-5581-4c76-9522-ba698d36b5fb	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 22:46:35.476455+00	
00000000-0000-0000-0000-000000000000	8b2594ab-27f0-47e1-94cd-6fac8eb864c7	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 22:46:35.492113+00	
00000000-0000-0000-0000-000000000000	5f74a19b-8119-4d42-ba93-1ec861a91afc	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 00:43:11.250685+00	
00000000-0000-0000-0000-000000000000	e42f2ebe-3bc1-4c52-a904-7b991ae33c8d	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 00:43:11.263442+00	
00000000-0000-0000-0000-000000000000	14d299fc-459b-45b0-badc-9866fbe1c919	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 02:39:51.286397+00	
00000000-0000-0000-0000-000000000000	7a67b6fb-a50d-417a-9ca5-0708a7a357a8	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 02:39:51.299337+00	
00000000-0000-0000-0000-000000000000	e52efd3e-018a-48ab-a494-854a8410e418	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 04:36:27.429143+00	
00000000-0000-0000-0000-000000000000	3e0e2f5a-ab4f-40f3-8c62-82518fb1eff4	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 04:36:27.453085+00	
00000000-0000-0000-0000-000000000000	fb83e5a0-18b7-47ae-b40f-5dce8a429b79	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 06:33:02.262037+00	
00000000-0000-0000-0000-000000000000	7b45360d-04f8-47ff-a8cb-fc20a6462087	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 06:33:02.27418+00	
00000000-0000-0000-0000-000000000000	b4876468-0cf3-4528-8482-3cc4f8407bc8	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 08:29:37.248413+00	
00000000-0000-0000-0000-000000000000	067ea99a-c782-4a23-8fb2-932802b413bd	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 08:29:37.269715+00	
00000000-0000-0000-0000-000000000000	ffc5da22-a77f-4415-ae94-5c391ae7bba1	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 10:26:14.083418+00	
00000000-0000-0000-0000-000000000000	7a2faadf-9cd7-4daf-b57f-1ea3997ca6d3	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 10:26:14.098651+00	
00000000-0000-0000-0000-000000000000	dbb271f1-ac44-443d-bc4b-2f1e09bfd08b	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 12:22:51.079379+00	
00000000-0000-0000-0000-000000000000	4cc52e70-e044-47dd-b6aa-f868dbdf5ff2	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 12:22:51.092056+00	
00000000-0000-0000-0000-000000000000	9b81aee6-12a2-4d94-a4a5-b81b34238d01	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-07 20:46:39.284765+00	
00000000-0000-0000-0000-000000000000	5b1a319a-c0f4-4179-9556-b3c5b2040cc9	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"sudostudystudenttesting@gmail.com","user_id":"a76ded16-86fc-4fbb-b7d8-ed6399ce8910","user_phone":""}}	2025-10-23 11:59:11.39063+00	
00000000-0000-0000-0000-000000000000	8179b9b0-e5b5-426c-8314-cfc035e4b9e5	{"action":"token_refreshed","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 12:55:11.854339+00	
00000000-0000-0000-0000-000000000000	858aba64-4ec3-48f4-b4a7-1fb5557452c2	{"action":"token_revoked","actor_id":"14385756-259e-4995-8aff-eaf8fe1988e7","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 12:55:11.863128+00	
00000000-0000-0000-0000-000000000000	b8363aeb-a383-4a1b-8e9e-65b5a8cd6bda	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@loanplatform.com","user_id":"14385756-259e-4995-8aff-eaf8fe1988e7","user_phone":""}}	2025-10-23 12:58:33.720912+00	
00000000-0000-0000-0000-000000000000	03ef4229-c220-41e2-8259-5c131fa35bbc	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@loanplatform.com","user_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","user_phone":""}}	2025-10-23 13:03:17.529914+00	
00000000-0000-0000-0000-000000000000	b7eeee4f-76f1-4dfa-9fb5-49c8a1716734	{"action":"login","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-23 13:04:02.244231+00	
00000000-0000-0000-0000-000000000000	98976d96-a355-4bc3-b3e7-f3b59a629372	{"action":"login","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-23 13:04:07.20401+00	
00000000-0000-0000-0000-000000000000	d2e29c3e-b6fa-424b-96c7-2434e5c9651d	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"abdulrehman@sudostudy.com","user_id":"b6a99233-868e-4743-9b8e-40223fb4f9e8"}}	2025-10-23 13:04:54.740776+00	
00000000-0000-0000-0000-000000000000	d701bc96-3b83-4e0e-9bcf-9606405ada3e	{"action":"user_signedup","actor_id":"b6a99233-868e-4743-9b8e-40223fb4f9e8","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-10-23 13:05:36.116654+00	
00000000-0000-0000-0000-000000000000	fb085bc6-9d7b-4840-858e-c4387011da73	{"action":"user_updated_password","actor_id":"b6a99233-868e-4743-9b8e-40223fb4f9e8","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"user"}	2025-10-23 13:06:01.064997+00	
00000000-0000-0000-0000-000000000000	9ec93326-a836-426f-8278-a5a924d59d59	{"action":"user_modified","actor_id":"b6a99233-868e-4743-9b8e-40223fb4f9e8","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"user"}	2025-10-23 13:06:01.06666+00	
00000000-0000-0000-0000-000000000000	9ad249e0-c870-43a3-9ce5-4a793877157d	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"effectedars29@gmail.com","user_id":"11181907-e372-48c9-8f40-26a675d37a57"}}	2025-10-23 13:07:13.375751+00	
00000000-0000-0000-0000-000000000000	248d4b4f-26a4-4c85-b24e-d1f475e5fa1e	{"action":"user_signedup","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-10-23 13:16:16.329708+00	
00000000-0000-0000-0000-000000000000	7fade6b9-1e47-45ad-bfc3-fb33f5704d08	{"action":"user_updated_password","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-23 13:16:45.950542+00	
00000000-0000-0000-0000-000000000000	92c8bf61-23ef-4b34-8c35-ead37ecd343a	{"action":"user_modified","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-23 13:16:45.952236+00	
00000000-0000-0000-0000-000000000000	0a456448-2ede-411a-b30d-eea24e94a8e1	{"action":"token_refreshed","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 14:02:24.346351+00	
00000000-0000-0000-0000-000000000000	67698264-178b-45bc-b11b-06e74e4e12c2	{"action":"token_revoked","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 14:02:24.366882+00	
00000000-0000-0000-0000-000000000000	2768ce5d-ee8f-48c2-8dd4-283661145a57	{"action":"token_refreshed","actor_id":"b6a99233-868e-4743-9b8e-40223fb4f9e8","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 14:04:19.242665+00	
00000000-0000-0000-0000-000000000000	6344a430-2bc1-4082-9374-cff5c1199e61	{"action":"token_revoked","actor_id":"b6a99233-868e-4743-9b8e-40223fb4f9e8","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 14:04:19.255698+00	
00000000-0000-0000-0000-000000000000	4e75f473-0f13-4616-b062-32b6571adefd	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-23 14:12:46.250777+00	
00000000-0000-0000-0000-000000000000	380844b8-1d04-423d-ac2f-40429459c27f	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 14:14:18.27019+00	
00000000-0000-0000-0000-000000000000	d1864004-d1d2-475b-8e6c-07ed3af002d1	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 14:14:18.271134+00	
00000000-0000-0000-0000-000000000000	8395d364-4388-4dd9-a9e1-20035b64ac8a	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-23 14:58:59.243658+00	
00000000-0000-0000-0000-000000000000	4c8308b2-fdf6-4bac-ad34-97505e6f80f7	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-23 15:00:52.652369+00	
00000000-0000-0000-0000-000000000000	17d061b4-0d7f-4809-8736-5db0da974376	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-23 15:54:53.62613+00	
00000000-0000-0000-0000-000000000000	c077c22c-c64a-44a3-b3fa-8c9cc4792c8e	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-23 16:00:05.797311+00	
00000000-0000-0000-0000-000000000000	994e2f92-1a57-4155-8de5-d3791a6f680c	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 18:16:03.759902+00	
00000000-0000-0000-0000-000000000000	6d72e387-1bfe-40ca-9fea-af0a9a816e13	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 18:16:03.786411+00	
00000000-0000-0000-0000-000000000000	c7432b9b-1d74-4601-991f-7290c57cfe08	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-27 06:07:15.398738+00	
00000000-0000-0000-0000-000000000000	b3d4a644-2064-4f15-81a5-2711304fbb11	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-27 06:07:15.424658+00	
00000000-0000-0000-0000-000000000000	2748f23a-001c-4572-a2a6-80fbf76b3e08	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-27 07:05:24.856896+00	
00000000-0000-0000-0000-000000000000	9300792d-7af9-49a6-8910-7a2637938e06	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-27 07:05:24.869806+00	
00000000-0000-0000-0000-000000000000	f65085ea-ce9c-4d94-9342-b4d4620cfea5	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-27 08:03:40.314625+00	
00000000-0000-0000-0000-000000000000	57437584-8a60-437d-93db-55985d4b40bd	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-27 08:03:40.343654+00	
00000000-0000-0000-0000-000000000000	e126eef7-33f1-4163-b1dc-74d892a10db9	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-27 11:05:22.380601+00	
00000000-0000-0000-0000-000000000000	00e5df43-c42f-4ed4-b36b-e087a2885424	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-27 11:05:22.396742+00	
00000000-0000-0000-0000-000000000000	8fe26fb9-041f-483e-a776-d86840eb0d37	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-29 10:07:07.875294+00	
00000000-0000-0000-0000-000000000000	32e09d00-8a3e-4739-bf2d-147a3b81dc51	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-29 10:07:07.895915+00	
00000000-0000-0000-0000-000000000000	884d3178-b167-4dda-9082-f19a54b7628f	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-29 11:44:57.462019+00	
00000000-0000-0000-0000-000000000000	12f80c1d-d04a-4a6b-a03f-e15858f48702	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-29 11:44:57.47895+00	
00000000-0000-0000-0000-000000000000	34776d79-9907-420c-8b3f-2348806f612f	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-29 12:43:12.076221+00	
00000000-0000-0000-0000-000000000000	b501d904-dc73-4f80-b8e3-249290ba3f15	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-29 12:43:12.093867+00	
00000000-0000-0000-0000-000000000000	c2e8c6ed-0e4d-4341-83e5-c15d97468b29	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-29 13:41:35.019064+00	
00000000-0000-0000-0000-000000000000	40027213-6f74-4477-b24c-97fb6978f5c9	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-29 13:41:35.042721+00	
00000000-0000-0000-0000-000000000000	ec9d909b-73fb-4844-8915-9e70d65b39aa	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 09:25:04.4834+00	
00000000-0000-0000-0000-000000000000	aed96ec7-839e-4193-bb15-c459615b248b	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 09:25:04.509576+00	
00000000-0000-0000-0000-000000000000	98b296cb-5814-4e45-9294-acbaa982b1a0	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 10:23:23.1277+00	
00000000-0000-0000-0000-000000000000	50a57281-53bd-4b12-871a-9391a67c3597	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 10:23:23.141922+00	
00000000-0000-0000-0000-000000000000	07e057ac-2a8e-4569-a459-279d338dd785	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 11:21:43.22249+00	
00000000-0000-0000-0000-000000000000	40f61bcf-3bec-4c2e-af37-fb04beb6e65f	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 11:21:43.247298+00	
00000000-0000-0000-0000-000000000000	86b0e09d-7beb-4eeb-b8ab-7f9b4d74a5a2	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-31 12:01:10.622944+00	
00000000-0000-0000-0000-000000000000	22ed5afb-5548-49e8-a26d-0bbdfab10475	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 12:19:44.346873+00	
00000000-0000-0000-0000-000000000000	acb56125-6e8e-490c-a5c8-82f017dec5f3	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 12:19:44.361409+00	
00000000-0000-0000-0000-000000000000	66336612-d48f-41d1-aad1-61e9602f12da	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-31 13:22:02.996335+00	
00000000-0000-0000-0000-000000000000	3edbc9d0-a637-4c18-95f9-3ee51986cdfe	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 16:08:02.50851+00	
00000000-0000-0000-0000-000000000000	987d3832-3ec4-4eec-9958-dafb450cfbc4	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 16:08:02.53149+00	
00000000-0000-0000-0000-000000000000	547f11e2-88b3-4e10-802a-09154138b6db	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 17:06:25.625811+00	
00000000-0000-0000-0000-000000000000	85af606e-7254-4696-899f-fc07548fced2	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 17:06:25.635182+00	
00000000-0000-0000-0000-000000000000	c023e5c6-afa4-4d49-aae4-42448259bae1	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 18:04:55.899047+00	
00000000-0000-0000-0000-000000000000	63c75f08-836e-4254-a95c-16e09e3b4e9d	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 18:04:55.918905+00	
00000000-0000-0000-0000-000000000000	9ba3a767-638d-4ffd-b42d-d9bb18cf3bcb	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 21:10:10.543731+00	
00000000-0000-0000-0000-000000000000	26574e6c-7b90-41e1-ad7c-4e0a4e92a4e6	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 21:10:10.561939+00	
00000000-0000-0000-0000-000000000000	4736d106-b057-4a6a-81c8-e4e740ff46e0	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 07:08:35.093232+00	
00000000-0000-0000-0000-000000000000	2f838e26-0cd7-46b9-a6e8-32abc4d63e9d	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 07:08:35.116521+00	
00000000-0000-0000-0000-000000000000	fd435b77-da23-44d1-aec3-fb9111b01b0e	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 08:07:04.745459+00	
00000000-0000-0000-0000-000000000000	a821a162-b3e4-4b1c-9fa7-e8100b51dccd	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 08:07:04.761897+00	
00000000-0000-0000-0000-000000000000	44a71712-4e94-4ac6-87e6-b52812ed3b68	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 09:05:34.751484+00	
00000000-0000-0000-0000-000000000000	8d47ac5c-5ddf-4669-9478-eabd42bd9a3a	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 09:05:34.766967+00	
00000000-0000-0000-0000-000000000000	252b5211-0042-4bca-aada-1dbbe907afd0	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 12:07:50.259671+00	
00000000-0000-0000-0000-000000000000	b38f10ce-2caf-4ee2-85de-f5ad0c57ee61	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 12:07:50.268311+00	
00000000-0000-0000-0000-000000000000	07d8ff5e-7fd3-465b-8fcc-8516c19d227b	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-01 17:02:01.506089+00	
00000000-0000-0000-0000-000000000000	e0bbd1d3-a822-4dbd-a690-3ef2a43787ce	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-02 11:54:11.283934+00	
00000000-0000-0000-0000-000000000000	ae1feca5-ffab-4c74-9fd6-8647a7bd6a78	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-02 11:54:11.30208+00	
00000000-0000-0000-0000-000000000000	a70d314d-9ac7-498c-9fe2-517e8aac029c	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-03 09:25:03.206936+00	
00000000-0000-0000-0000-000000000000	3a641aa1-dd07-4e11-8a44-87243f1aaba4	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-03 09:25:03.22499+00	
00000000-0000-0000-0000-000000000000	6de1498d-0f69-4ab5-8c58-b112abceda47	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-04 11:02:14.873228+00	
00000000-0000-0000-0000-000000000000	f44080eb-0fd5-4aba-ad4f-3b72d0756f34	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-04 12:00:53.385244+00	
00000000-0000-0000-0000-000000000000	bde36ed8-12fc-4972-ae3e-e827d03830d4	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-04 12:00:53.398674+00	
00000000-0000-0000-0000-000000000000	465787d8-82e6-4406-99eb-a5701f266acc	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-04 12:59:24.928139+00	
00000000-0000-0000-0000-000000000000	12d04169-5be1-4947-a47d-3d06d0ed1387	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-04 12:59:24.938222+00	
00000000-0000-0000-0000-000000000000	8cc9baea-8cff-436f-bc59-c847bc4f5867	{"action":"logout","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-04 13:02:04.732313+00	
00000000-0000-0000-0000-000000000000	c54b1c7c-7716-4d1a-be0c-6aa1276d0b28	{"action":"login","actor_id":"b6a99233-868e-4743-9b8e-40223fb4f9e8","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-04 13:02:37.26391+00	
00000000-0000-0000-0000-000000000000	0435ce85-402d-4519-9bec-7838460cdb50	{"action":"logout","actor_id":"b6a99233-868e-4743-9b8e-40223fb4f9e8","actor_username":"abdulrehman@sudostudy.com","actor_via_sso":false,"log_type":"account"}	2025-11-04 13:15:55.13188+00	
00000000-0000-0000-0000-000000000000	d6df8a2d-1e75-4285-bdc6-00062afa66ef	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-04 13:16:00.057176+00	
00000000-0000-0000-0000-000000000000	f1ff37e3-b5fe-462f-a317-062ae1e63aa8	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-04 14:03:52.994411+00	
00000000-0000-0000-0000-000000000000	aa2e0757-6a06-4535-b64d-79e6089f9da7	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-04 14:29:13.130147+00	
00000000-0000-0000-0000-000000000000	7f6513b6-29dd-4cf4-91c3-73ed6c8a13ae	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-04 14:29:32.898196+00	
00000000-0000-0000-0000-000000000000	9d524a3e-527f-4f3c-a33d-5bbd887d876a	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-04 14:29:32.901741+00	
00000000-0000-0000-0000-000000000000	5611b90f-b9d3-47ff-8f3f-176710a8262f	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-04 15:35:14.341454+00	
00000000-0000-0000-0000-000000000000	6e912429-74ab-4ca3-82b8-79d675bdb5d2	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-04 15:35:14.366837+00	
00000000-0000-0000-0000-000000000000	614e0f58-85bd-469c-8ef1-ac738aea2a5a	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 13:08:32.256677+00	
00000000-0000-0000-0000-000000000000	1882a37f-e978-4431-9537-df90fc86e722	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 13:08:32.277531+00	
00000000-0000-0000-0000-000000000000	ab4045d4-ab78-4b25-8471-9c66480501b2	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 15:43:13.220908+00	
00000000-0000-0000-0000-000000000000	131ed456-f256-4291-a42a-d9ea517e8047	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 15:43:13.234097+00	
00000000-0000-0000-0000-000000000000	db94c7ae-e7e7-4027-805e-7369ed77ef1e	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-05 16:19:51.75676+00	
00000000-0000-0000-0000-000000000000	a9867c8e-89eb-452a-a9f8-c611c76ab298	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 16:41:33.621671+00	
00000000-0000-0000-0000-000000000000	3ec89806-6553-4b5c-a4fb-f01765ed2191	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 16:41:33.658284+00	
00000000-0000-0000-0000-000000000000	657c7ae6-71bc-4172-a21b-6c6b27f6fb43	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-05 16:42:58.675425+00	
00000000-0000-0000-0000-000000000000	45247729-371e-485f-94b1-cccceea630df	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-05 17:02:48.270079+00	
00000000-0000-0000-0000-000000000000	dd5c137f-a2f0-4075-ae7d-60dc3d1d9756	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 17:39:37.395937+00	
00000000-0000-0000-0000-000000000000	693394c4-59cd-429a-aee3-8b2a71a14899	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 17:39:37.408647+00	
00000000-0000-0000-0000-000000000000	fb37fe01-2e73-413c-98c4-0f3c78dc2d61	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 17:41:17.415008+00	
00000000-0000-0000-0000-000000000000	51f1edcf-0a33-4f00-9046-3288bfea2e62	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 17:41:17.419681+00	
00000000-0000-0000-0000-000000000000	bee09b50-2820-4491-a363-8c2b2ff012bd	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 18:01:16.219335+00	
00000000-0000-0000-0000-000000000000	41973cc6-4c74-4099-8668-df9d683dd88f	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 18:01:16.22878+00	
00000000-0000-0000-0000-000000000000	328ef0e5-be1b-401a-8d9e-0c3ef9804c86	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 18:37:44.853276+00	
00000000-0000-0000-0000-000000000000	1b54fab0-2efb-4a81-9d26-0cf4dbfd93df	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 18:37:44.866+00	
00000000-0000-0000-0000-000000000000	c9885d50-48bd-43a9-bc1e-77168f065528	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 19:00:50.855705+00	
00000000-0000-0000-0000-000000000000	9840d788-a354-4d09-bc0d-c93ca40eabb5	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 19:00:50.87348+00	
00000000-0000-0000-0000-000000000000	00dfee35-4b66-4555-bff0-4879efe838b1	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 19:36:10.440524+00	
00000000-0000-0000-0000-000000000000	bfa2c458-447e-42b9-a273-d48c42b06e44	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 19:36:10.447934+00	
00000000-0000-0000-0000-000000000000	ee08b759-1779-42a3-946e-673383bf4206	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 20:16:40.823603+00	
00000000-0000-0000-0000-000000000000	f825f01c-b962-420b-8770-f9c7888a9435	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 20:16:40.849768+00	
00000000-0000-0000-0000-000000000000	582742c7-d470-4604-b598-7eda63018ef2	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 20:34:36.328788+00	
00000000-0000-0000-0000-000000000000	460fa293-c885-49dc-96c7-5d7a4a42c133	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 20:34:36.339086+00	
00000000-0000-0000-0000-000000000000	a52a873f-ca4d-41ff-a4f6-53034398aed3	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 21:34:56.777776+00	
00000000-0000-0000-0000-000000000000	ddd40893-9eea-4af6-bcf4-756357cb206e	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 21:34:56.806015+00	
00000000-0000-0000-0000-000000000000	22ce72df-b660-4d1d-8a14-19e66a52c178	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 22:33:09.113452+00	
00000000-0000-0000-0000-000000000000	d1e57702-7597-41e8-bd1d-596dad98e861	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 22:33:09.119584+00	
00000000-0000-0000-0000-000000000000	71dc2edd-e3bd-41ec-a767-702318b1a098	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-06 12:53:14.970484+00	
00000000-0000-0000-0000-000000000000	affd04ea-56da-402a-a5e9-41e65e5c4267	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-06 12:53:14.992239+00	
00000000-0000-0000-0000-000000000000	7eec7e45-e65f-40b2-ba1d-cb0b20b1a3a8	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-06 13:51:41.873016+00	
00000000-0000-0000-0000-000000000000	b5579543-fd4e-4b74-88c4-3c86a39b4957	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-06 13:51:41.885774+00	
00000000-0000-0000-0000-000000000000	470cdd28-fc1b-40dd-8555-b242a925b618	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-06 14:50:06.721108+00	
00000000-0000-0000-0000-000000000000	b18f3a8c-df88-495f-8613-4e1a96a75d38	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-06 14:50:06.738148+00	
00000000-0000-0000-0000-000000000000	33421c1e-1cd4-4cd8-9a32-68d09073ffa6	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-06 15:48:36.984095+00	
00000000-0000-0000-0000-000000000000	c72ae5f7-f0dc-4f74-b124-d88829f87532	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-06 15:48:36.998858+00	
00000000-0000-0000-0000-000000000000	7058ace1-1016-4fad-b8b2-3d3e5f85f034	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 06:30:38.713239+00	
00000000-0000-0000-0000-000000000000	0f740356-8b2f-4db1-801b-215e43964bae	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 06:30:38.734054+00	
00000000-0000-0000-0000-000000000000	1538b3a5-8771-41f9-96cf-d21b812b5942	{"action":"login","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-07 06:36:03.291226+00	
00000000-0000-0000-0000-000000000000	f89c1504-4057-494b-8479-3a4710c0146c	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"rabiuddin1@gmail.com","user_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab"}}	2025-11-07 06:37:57.142829+00	
00000000-0000-0000-0000-000000000000	9b329047-fbd8-4737-8f91-37ecd491fb04	{"action":"user_signedup","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-11-07 06:39:14.813332+00	
00000000-0000-0000-0000-000000000000	de9daba2-390e-4c8f-86db-fc81b393b1ba	{"action":"user_updated_password","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-07 06:40:01.894605+00	
00000000-0000-0000-0000-000000000000	952230b6-3c27-4c0f-9819-9dd2a4cd89c2	{"action":"user_modified","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-07 06:40:01.895802+00	
00000000-0000-0000-0000-000000000000	c0598f43-2933-43e1-938b-eb2928d5695f	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"066c62c6-d68e-45b8-9e4b-130254919ccc"}}	2025-11-07 06:40:43.378981+00	
00000000-0000-0000-0000-000000000000	04c36dc2-94e2-4b06-9a65-25cb8327a50c	{"action":"user_signedup","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-11-07 06:41:19.689701+00	
00000000-0000-0000-0000-000000000000	bfa72d40-f2c6-4d2f-987c-770c1c8366d5	{"action":"user_updated_password","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2025-11-07 06:42:05.953562+00	
00000000-0000-0000-0000-000000000000	04942729-5376-4a2d-9302-aee457af3bcd	{"action":"user_modified","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2025-11-07 06:42:05.954343+00	
00000000-0000-0000-0000-000000000000	0f8cf1cb-7cdb-4d54-9ae7-db73551c8859	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 07:29:02.001953+00	
00000000-0000-0000-0000-000000000000	03a60916-88ab-433e-8f66-e56efb575038	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 07:29:02.007665+00	
00000000-0000-0000-0000-000000000000	bf43f5cb-c311-4ecf-8df6-0fc165e69999	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-07 08:04:02.148447+00	
00000000-0000-0000-0000-000000000000	345ae7bc-9ea2-4916-8aaa-7ae6fcf1d143	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-07 08:04:02.164971+00	
00000000-0000-0000-0000-000000000000	61d3cd7d-cccb-4480-bbc4-7f90d0ec904e	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 08:27:03.470787+00	
00000000-0000-0000-0000-000000000000	e8df43e1-0469-4ae1-bf22-1b6fb415916a	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 08:27:03.493464+00	
00000000-0000-0000-0000-000000000000	9937b21e-b3a4-4e29-87d7-3ff82cdee9f6	{"action":"token_refreshed","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 08:39:32.075837+00	
00000000-0000-0000-0000-000000000000	e62a8a1e-4648-46bd-9157-a9b2d3d1d24c	{"action":"token_revoked","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 08:39:32.092665+00	
00000000-0000-0000-0000-000000000000	cb6db4c1-0397-4759-82c9-767f08a262c9	{"action":"token_refreshed","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 09:44:46.553372+00	
00000000-0000-0000-0000-000000000000	0b1ca4c2-3035-43ac-b304-c3484e0cd906	{"action":"token_revoked","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 09:44:46.572572+00	
00000000-0000-0000-0000-000000000000	b8317513-1392-463d-b902-7709b6be74ea	{"action":"login","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-07 10:25:08.028681+00	
00000000-0000-0000-0000-000000000000	89555d98-f222-45ca-9761-a5751cad9748	{"action":"logout","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account"}	2025-11-07 10:36:03.246821+00	
00000000-0000-0000-0000-000000000000	aaee9a11-ef3a-4991-b869-e7d4bf651dbe	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-07 10:36:22.222845+00	
00000000-0000-0000-0000-000000000000	54f24078-231c-4f05-b525-5c6e590888bc	{"action":"logout","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2025-11-07 10:38:49.730534+00	
00000000-0000-0000-0000-000000000000	2a2b9ec9-f3fc-4eb0-9fc2-518ee57f2fbd	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-07 10:38:57.226152+00	
00000000-0000-0000-0000-000000000000	a45d4f7d-459a-44f0-b0dc-30f31ab25d7c	{"action":"logout","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2025-11-07 10:39:25.610725+00	
00000000-0000-0000-0000-000000000000	fe9e56f4-6038-4462-bf6d-b89f640d0f21	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-07 10:39:29.082215+00	
00000000-0000-0000-0000-000000000000	9b3c43b1-a976-41db-a5c8-2399f405ff38	{"action":"logout","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2025-11-07 10:39:44.98707+00	
00000000-0000-0000-0000-000000000000	2e8a22e0-5641-444c-b4f4-2b5e59de2d25	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-07 10:39:56.441226+00	
00000000-0000-0000-0000-000000000000	1a110785-52a8-488e-8f8b-7299d4ec9840	{"action":"logout","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-07 10:40:15.490996+00	
00000000-0000-0000-0000-000000000000	6043bff9-7a93-46ff-931d-f017b438537b	{"action":"login","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-07 10:40:20.341769+00	
00000000-0000-0000-0000-000000000000	a7aa9f36-e965-46db-94f5-b70efb207a59	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-07 10:43:34.226863+00	
00000000-0000-0000-0000-000000000000	102d6b6e-9a62-4ede-898e-65d4fb7ade28	{"action":"logout","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-07 11:17:47.818545+00	
00000000-0000-0000-0000-000000000000	9857a114-297a-46b2-9260-cee29b0f58d2	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-07 11:17:51.182121+00	
00000000-0000-0000-0000-000000000000	92d0e946-8d5d-4ba3-9c61-06de4fe15cfe	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 11:33:49.74582+00	
00000000-0000-0000-0000-000000000000	e57157a3-b4af-41a6-a5c0-b92a908efbd4	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 11:33:49.764225+00	
00000000-0000-0000-0000-000000000000	7b2bb24a-f903-465a-962b-17133bbe9c5c	{"action":"token_refreshed","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 11:38:27.939779+00	
00000000-0000-0000-0000-000000000000	5016f0ff-9bda-4af8-8955-8e42d7296f7e	{"action":"token_revoked","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 11:38:27.945605+00	
00000000-0000-0000-0000-000000000000	156537de-c034-4990-b4a6-bba2ff81635a	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-07 12:15:51.940647+00	
00000000-0000-0000-0000-000000000000	18ae15fe-cc42-4e76-820f-81abc49db3a2	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-07 12:15:51.957462+00	
00000000-0000-0000-0000-000000000000	57318243-2364-4962-99e6-feef3cec6e50	{"action":"token_refreshed","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 12:36:44.218581+00	
00000000-0000-0000-0000-000000000000	44188f33-7ae9-4d46-9b2b-846912872fe3	{"action":"token_revoked","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 12:36:44.238365+00	
00000000-0000-0000-0000-000000000000	e721caf5-9933-406c-b319-305578d9f897	{"action":"logout","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account"}	2025-11-07 12:36:56.213576+00	
00000000-0000-0000-0000-000000000000	a9b0a67e-a9a1-4956-8d04-2d84ec40223c	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-07 12:36:59.470259+00	
00000000-0000-0000-0000-000000000000	4f5b1989-3e44-48ec-ae40-abeb96aa3f00	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-08 11:59:57.716387+00	
00000000-0000-0000-0000-000000000000	ab781edc-3db0-4f5e-b9ac-3845266da9b9	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-08 11:59:57.740253+00	
00000000-0000-0000-0000-000000000000	c69c4a0b-8bc3-4a79-8d50-c7cdffc7ff94	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-08 12:00:02.789917+00	
00000000-0000-0000-0000-000000000000	74ac263b-df5b-4faa-b419-971fe612251d	{"action":"logout","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2025-11-08 12:01:42.344235+00	
00000000-0000-0000-0000-000000000000	713a3a29-f51e-4fa4-bf1b-1ce8417b8bc7	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-08 12:01:54.283667+00	
00000000-0000-0000-0000-000000000000	fc03b418-6752-4a1d-9af6-6487a3168b37	{"action":"logout","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-08 12:02:22.538276+00	
00000000-0000-0000-0000-000000000000	1f9720b3-435a-4379-bc1b-0c08db1c7ca4	{"action":"login","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-08 12:02:27.581991+00	
00000000-0000-0000-0000-000000000000	618039ae-a868-4ed4-9637-14cbab187cb8	{"action":"token_refreshed","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-11-08 13:00:54.194346+00	
00000000-0000-0000-0000-000000000000	5ca39afd-51e3-4747-98a1-eece28891372	{"action":"token_revoked","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-11-08 13:00:54.204898+00	
00000000-0000-0000-0000-000000000000	446ebb56-dcb4-4584-a28f-00944503ce75	{"action":"token_refreshed","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-11-08 14:00:33.669345+00	
00000000-0000-0000-0000-000000000000	be1f118b-fb55-4806-956d-80084fd89200	{"action":"token_revoked","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-11-08 14:00:33.678978+00	
00000000-0000-0000-0000-000000000000	6e0436b1-131b-49d8-a991-f2086cc73815	{"action":"token_refreshed","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-11-09 05:28:24.711438+00	
00000000-0000-0000-0000-000000000000	ea911748-0e9e-4d33-9044-77681d612e25	{"action":"token_revoked","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2025-11-09 05:28:24.734281+00	
00000000-0000-0000-0000-000000000000	33eb2ecf-3d4b-42af-ad07-7dfabdcc8380	{"action":"login","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 05:28:55.913552+00	
00000000-0000-0000-0000-000000000000	030a7155-66fa-41ed-8c3b-ea0d20d97f0c	{"action":"logout","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account"}	2025-11-09 05:37:32.889182+00	
00000000-0000-0000-0000-000000000000	45d709b3-4097-44a2-b6cb-fe612093961b	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 05:37:45.840387+00	
00000000-0000-0000-0000-000000000000	a90412e4-60fa-4eb8-9b74-ed95b9b6222d	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 05:39:02.92356+00	
00000000-0000-0000-0000-000000000000	69ce84bb-a946-4301-9afc-ac60e8d5c39e	{"action":"logout","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-09 05:41:11.159306+00	
00000000-0000-0000-0000-000000000000	7e37b5da-1268-4a45-9b6b-c35314580a59	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 05:41:14.408193+00	
00000000-0000-0000-0000-000000000000	148d5565-bfdd-44f4-87fc-6bc693d83d3a	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-09 10:02:51.58977+00	
00000000-0000-0000-0000-000000000000	a2894653-0dd0-4281-8eca-6c38e6e15d78	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-09 10:02:51.60572+00	
00000000-0000-0000-0000-000000000000	7234e964-bba0-4b64-8a58-4447f73982d6	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-11 07:48:42.767862+00	
00000000-0000-0000-0000-000000000000	e9e5c17a-5bf7-462c-a035-76e7cf38965a	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-11 07:48:42.790516+00	
00000000-0000-0000-0000-000000000000	d3999b6b-2492-4d12-8de2-fe7194a3a095	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-11 07:49:06.604442+00	
00000000-0000-0000-0000-000000000000	b7c4efe6-8147-4f0e-a6d4-0f1866b95c1f	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-11 08:47:08.574045+00	
00000000-0000-0000-0000-000000000000	221b7160-f05b-4a90-ae28-2f2868e996c8	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-11 08:47:08.592252+00	
00000000-0000-0000-0000-000000000000	ce1c2f98-95af-4474-aaeb-c65ae20a04eb	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-11 09:45:27.958237+00	
00000000-0000-0000-0000-000000000000	78820800-bb8f-4fb2-b043-3d39b1ba2fe8	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-11 09:45:27.983461+00	
00000000-0000-0000-0000-000000000000	58211ce5-c5b0-4a12-a08f-f21d82a9646d	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-11 10:43:39.492894+00	
00000000-0000-0000-0000-000000000000	a9f0d6e1-5e02-44cd-84b1-42a92ba1b682	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-11 10:43:39.512008+00	
00000000-0000-0000-0000-000000000000	bc44247a-865f-4872-88d4-b30421db31a5	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-11 11:41:56.512046+00	
00000000-0000-0000-0000-000000000000	5cb778ef-a9e6-4eaf-9b25-6d8aec4d36d8	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-11 11:41:56.531168+00	
00000000-0000-0000-0000-000000000000	7210425e-1d42-4dd9-84d7-66e77773e3e7	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-13 10:48:57.128977+00	
00000000-0000-0000-0000-000000000000	1b161556-d065-4f66-a922-4c02e047470d	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-13 10:48:57.155608+00	
00000000-0000-0000-0000-000000000000	38269336-3692-4a42-ace8-38fa46bd3b40	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-13 10:49:07.23606+00	
00000000-0000-0000-0000-000000000000	74a9c95f-773b-46ac-8245-820b9ac40c41	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-13 11:51:15.809214+00	
00000000-0000-0000-0000-000000000000	0fda1521-034e-42d4-ae91-dd7f6ffa5b5d	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-13 11:51:15.823513+00	
00000000-0000-0000-0000-000000000000	ea33f162-e816-4cda-b309-de1ada125de7	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-13 12:00:11.73276+00	
00000000-0000-0000-0000-000000000000	41fcb184-a014-49a1-a27b-a6e6d09ea85b	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-13 12:00:11.744445+00	
00000000-0000-0000-0000-000000000000	846ae788-fb83-4473-bd6e-2f3a280dc7bb	{"action":"logout","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2025-11-13 12:37:04.015908+00	
00000000-0000-0000-0000-000000000000	10e6cb33-46ee-4adb-85bd-c63a89de3380	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-13 12:38:48.948804+00	
00000000-0000-0000-0000-000000000000	0bc69018-0a91-4bd8-bb36-dd48de0a540f	{"action":"logout","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2025-11-13 12:42:21.818417+00	
00000000-0000-0000-0000-000000000000	d16fc692-c684-4a81-8eaf-1b54eb7fb27b	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-13 12:42:33.842501+00	
00000000-0000-0000-0000-000000000000	82910b31-a7bc-433f-b416-defbe1ead06e	{"action":"logout","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-13 12:42:42.706016+00	
00000000-0000-0000-0000-000000000000	274f76ae-305f-4dbf-b282-696f2058b299	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-13 12:42:45.925482+00	
00000000-0000-0000-0000-000000000000	b42cc66a-8657-4770-817c-82b008d24ee1	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-13 13:40:49.130521+00	
00000000-0000-0000-0000-000000000000	632001ea-6b23-4943-a12a-020319100a22	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-13 13:40:49.146502+00	
00000000-0000-0000-0000-000000000000	97b48470-a562-4c7e-b440-0e26131fe988	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-13 14:39:16.528814+00	
00000000-0000-0000-0000-000000000000	33cbe61d-1afc-4afe-b8cb-58ca01823f2a	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-13 14:39:16.549722+00	
00000000-0000-0000-0000-000000000000	aaa1e652-a81f-4959-b27b-63bdd81a663e	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-13 15:37:46.247366+00	
00000000-0000-0000-0000-000000000000	82b22405-9c15-410f-a0f0-4e93779ef8aa	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-13 15:37:46.269758+00	
00000000-0000-0000-0000-000000000000	5fab6d80-71c0-4ea7-85d0-cc6969d629aa	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-14 05:07:09.054393+00	
00000000-0000-0000-0000-000000000000	bc9deee4-e1fd-48e9-9873-fc18489f8be6	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-14 05:07:09.067009+00	
00000000-0000-0000-0000-000000000000	3e58a258-daf0-44c0-b3f4-0954a9aad90e	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-14 05:07:28.589581+00	
00000000-0000-0000-0000-000000000000	5889dac2-338e-47f3-a856-8a6790aad019	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-14 06:05:41.469436+00	
00000000-0000-0000-0000-000000000000	46cd730a-3c3e-4dfd-94d0-a9e1ffbb4343	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-14 06:05:41.486252+00	
00000000-0000-0000-0000-000000000000	f5cdfe05-b35a-4c17-940d-a496179e25e0	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-14 09:48:51.427178+00	
00000000-0000-0000-0000-000000000000	fc1039f7-3440-48a1-8980-25f1644fa0e4	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-14 09:48:51.45665+00	
00000000-0000-0000-0000-000000000000	a4ad11a9-8905-4836-8716-4803face2708	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-14 10:47:29.064889+00	
00000000-0000-0000-0000-000000000000	50dd9f08-fbee-4de0-8042-8883c4881e5f	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-14 10:47:29.094741+00	
00000000-0000-0000-0000-000000000000	59cf7acc-4954-4c8c-b04c-917d106894d4	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-14 11:45:47.508942+00	
00000000-0000-0000-0000-000000000000	96ba07db-b7b8-4257-a093-beae82646366	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-14 11:45:47.523337+00	
00000000-0000-0000-0000-000000000000	0d76eb16-dc93-4b7a-8c96-f2406debe947	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-17 08:07:40.36765+00	
00000000-0000-0000-0000-000000000000	cb3f598a-0d54-4ca4-99a4-3063b2072aff	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-17 08:07:40.396353+00	
00000000-0000-0000-0000-000000000000	be08ce31-e0bb-4540-9851-bf60c6dd6a7a	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-17 09:38:22.193605+00	
00000000-0000-0000-0000-000000000000	b094b285-db56-4d5d-ab3c-f4cd9b4e9f86	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-17 09:38:22.206928+00	
00000000-0000-0000-0000-000000000000	67db9511-bbde-4678-a773-4ebbfe671031	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-17 11:03:15.652148+00	
00000000-0000-0000-0000-000000000000	769efff0-828c-4b54-9562-390faa41d569	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-17 11:03:15.667047+00	
00000000-0000-0000-0000-000000000000	0238f521-3c1f-4fb2-8cb1-bba51e69d4c5	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-17 12:01:58.833668+00	
00000000-0000-0000-0000-000000000000	daf9cda5-27c3-445e-9810-530f32c62d26	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-17 12:01:58.865685+00	
00000000-0000-0000-0000-000000000000	e9cd0e4b-afed-4447-b2f3-9ba9d6a74703	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-17 14:03:55.167927+00	
00000000-0000-0000-0000-000000000000	9ecbee39-514c-4cd9-8ecf-df98a6067cb1	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-17 14:03:55.188936+00	
00000000-0000-0000-0000-000000000000	2228bf6b-a535-416f-9fa2-d90dac9a93cd	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-17 16:44:51.087054+00	
00000000-0000-0000-0000-000000000000	5f6725dd-0443-476b-b6f2-c116763b41af	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-17 16:44:51.109707+00	
00000000-0000-0000-0000-000000000000	0d851649-7c02-4ba1-910f-f91645dabbdb	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-18 05:49:03.976303+00	
00000000-0000-0000-0000-000000000000	07b25351-50d6-443d-afa4-69642a6538dd	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-18 05:49:03.99842+00	
00000000-0000-0000-0000-000000000000	994e093e-58e9-4b63-8358-b3d8fe4bf7b2	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 05:49:11.895491+00	
00000000-0000-0000-0000-000000000000	1afb11c3-fada-4dce-9fef-05a13d4181a2	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-18 06:47:20.102727+00	
00000000-0000-0000-0000-000000000000	9b8b954b-f467-4c15-a192-373f2d48eb30	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-18 06:47:20.122674+00	
00000000-0000-0000-0000-000000000000	8fcdbc44-e2b8-40d1-9bb9-e1bb71bc626b	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-18 07:45:33.32515+00	
00000000-0000-0000-0000-000000000000	c3b3a567-1a7e-4d69-9ce4-c422cd5a3db7	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-18 07:45:33.34438+00	
00000000-0000-0000-0000-000000000000	1c2da468-ae5c-4794-959f-3704ddc6cb88	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-18 08:16:12.313615+00	
00000000-0000-0000-0000-000000000000	5421ef8a-c1e6-43e5-ab9a-5a611133b1fb	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-18 08:16:12.332092+00	
00000000-0000-0000-0000-000000000000	80778630-0e93-4462-ad46-ce2165273183	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-18 08:43:44.949673+00	
00000000-0000-0000-0000-000000000000	7bce33b1-9145-40b5-922f-51fa5cc79485	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-18 08:43:44.963273+00	
00000000-0000-0000-0000-000000000000	0f8a5e78-a5ab-4f99-af5a-9994c6385bb6	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-18 09:14:27.37228+00	
00000000-0000-0000-0000-000000000000	bb3922fd-c992-4a85-b126-2600cd681649	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-18 09:14:27.386561+00	
00000000-0000-0000-0000-000000000000	a562c043-3ea1-43b2-9512-663c7c428838	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-18 10:12:43.404193+00	
00000000-0000-0000-0000-000000000000	c871e61f-427e-4804-9cfa-fe14b580212d	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-18 10:12:43.42976+00	
00000000-0000-0000-0000-000000000000	cf07dade-6a0b-4cf2-85b1-f8e2517c3a64	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-18 10:12:50.638562+00	
00000000-0000-0000-0000-000000000000	2c800355-f136-45cd-875c-2e36d041eeff	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-18 10:12:50.640479+00	
00000000-0000-0000-0000-000000000000	16329fea-918e-4e11-93d6-d56e4037064e	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-18 10:30:13.656853+00	
00000000-0000-0000-0000-000000000000	4749b52e-62f3-43a0-a657-28ec72648f60	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-18 10:30:13.661918+00	
00000000-0000-0000-0000-000000000000	69717e70-7d29-45b6-8099-b1d8dd81b60f	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-18 11:11:07.593237+00	
00000000-0000-0000-0000-000000000000	601c0af7-71ea-4fdc-ac58-a45954cbf726	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-18 11:11:07.620991+00	
00000000-0000-0000-0000-000000000000	5a73b610-619a-4765-b5a1-75710e829b8b	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-18 11:28:37.968574+00	
00000000-0000-0000-0000-000000000000	6432d7df-10cd-4573-bf60-87b099335446	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-18 11:28:37.979939+00	
00000000-0000-0000-0000-000000000000	8fac2576-091b-45c6-a6b6-86edbafc68ce	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-18 12:11:16.159084+00	
00000000-0000-0000-0000-000000000000	129dd2f7-0d6d-4b67-a24b-063337477ad6	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-18 12:11:16.183643+00	
00000000-0000-0000-0000-000000000000	7c26b0ca-d57a-4f67-aff0-430f2b73d1fd	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-18 13:09:29.398824+00	
00000000-0000-0000-0000-000000000000	2c7f17eb-0599-4f3d-84ad-c8b7b27ffe5e	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-18 13:09:29.416436+00	
00000000-0000-0000-0000-000000000000	790932cd-1f43-456c-bdb7-ab4700d64eac	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-20 08:12:19.228572+00	
00000000-0000-0000-0000-000000000000	299913d5-2249-400f-b08a-b5b43bd6088e	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-20 08:12:19.25345+00	
00000000-0000-0000-0000-000000000000	f87745b4-b972-4b96-a30a-c6fc186d4a50	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-20 08:12:29.943989+00	
00000000-0000-0000-0000-000000000000	c7bc23bd-807d-4789-b23c-d8a72089299f	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-20 09:10:42.070359+00	
00000000-0000-0000-0000-000000000000	1bf6f669-91a4-431f-a5b9-e8cf7a950f01	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-20 09:10:42.094529+00	
00000000-0000-0000-0000-000000000000	f70750bc-26b4-4b1c-9dfd-181448f9e9a9	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-20 10:09:13.882387+00	
00000000-0000-0000-0000-000000000000	64142974-a402-43e2-80fe-e755f62d070a	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-20 10:09:13.897448+00	
00000000-0000-0000-0000-000000000000	20d134a9-cb43-4ca3-8e37-81a173fd2c6b	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-20 11:08:36.644708+00	
00000000-0000-0000-0000-000000000000	b84b2aac-a9b6-47fc-8d1c-ded140e9fb59	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-20 11:08:36.658977+00	
00000000-0000-0000-0000-000000000000	d3b5911b-a2b9-48ae-9435-47209db5577a	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-21 08:31:56.897517+00	
00000000-0000-0000-0000-000000000000	b54aa043-4831-45a7-98bc-6ac8fe29116d	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-21 08:31:56.921252+00	
00000000-0000-0000-0000-000000000000	94616b70-07f0-44b5-878f-94d3f6cce7dd	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 08:37:15.362684+00	
00000000-0000-0000-0000-000000000000	cf4b1dcb-4596-4c64-a6b1-84813aa98018	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-21 09:35:22.367964+00	
00000000-0000-0000-0000-000000000000	09969789-1664-47d2-ba35-369d6f86ae88	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-21 09:35:22.387405+00	
00000000-0000-0000-0000-000000000000	d1e45f00-260a-4b7a-b752-60522f08f8fe	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-21 10:34:24.98586+00	
00000000-0000-0000-0000-000000000000	343adb78-8797-4427-ae0d-47d7c6ca15ad	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-21 10:34:25.000231+00	
00000000-0000-0000-0000-000000000000	3baa4601-6609-4ad2-8390-01e75ffc40c8	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-21 11:32:54.723484+00	
00000000-0000-0000-0000-000000000000	7394d361-fe56-43cd-92de-0421c86fb388	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-21 11:32:54.736442+00	
00000000-0000-0000-0000-000000000000	5874fb54-c50c-47b7-8e2b-d40157838fae	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 18:42:50.562743+00	
00000000-0000-0000-0000-000000000000	aa221db5-4c47-4990-966f-1d2094271e07	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-21 18:50:07.38092+00	
00000000-0000-0000-0000-000000000000	16bf3d14-bbd2-4a99-98bb-83f483d8e779	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-21 18:50:07.396261+00	
00000000-0000-0000-0000-000000000000	121a6def-32ad-4e7a-9181-d1aa05644aaf	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-21 19:48:13.751051+00	
00000000-0000-0000-0000-000000000000	4a3873e3-a5f9-4389-b826-7311bc925469	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-21 19:48:13.763451+00	
00000000-0000-0000-0000-000000000000	ef0d9a2b-da25-4b37-a837-5471a2ef9be3	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 20:08:08.803238+00	
00000000-0000-0000-0000-000000000000	9efce62c-3d93-47b2-81de-bb43a7d059c3	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 20:09:41.574806+00	
00000000-0000-0000-0000-000000000000	54446331-29c7-474b-a540-d73d02c96ad6	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 21:09:11.585732+00	
00000000-0000-0000-0000-000000000000	56c656ea-21ed-4da6-b4d9-6cdb27181963	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 09:55:13.492131+00	
00000000-0000-0000-0000-000000000000	2dddc9e5-d630-4011-9d82-ae74ca1df9fc	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 09:55:13.51618+00	
00000000-0000-0000-0000-000000000000	ce754950-1488-4e71-8297-34e14d7ae87e	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 09:56:10.451861+00	
00000000-0000-0000-0000-000000000000	cd863ad3-2d17-4cbd-afe7-4b1908dc6f92	{"action":"logout","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-24 09:56:25.392785+00	
00000000-0000-0000-0000-000000000000	7aae02d0-d166-42dd-997a-df1282110422	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 09:56:33.271507+00	
00000000-0000-0000-0000-000000000000	fd94d376-37d0-41bc-84fa-0eef651f8744	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 10:03:39.977845+00	
00000000-0000-0000-0000-000000000000	884acb00-7e62-4d6a-ae73-b790e2e77a8e	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 11:27:21.570193+00	
00000000-0000-0000-0000-000000000000	1db262bb-b4eb-4760-b29e-976aa4e710b8	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 11:27:21.596362+00	
00000000-0000-0000-0000-000000000000	210343b6-7b60-4995-9496-1b49520203ce	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 16:35:43.51554+00	
00000000-0000-0000-0000-000000000000	d76b485a-a6c2-4d58-93a0-fa42b7c9748f	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 16:38:01.165651+00	
00000000-0000-0000-0000-000000000000	3d560793-216e-49db-8cfb-bc5ee2d26041	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-24 16:45:44.580146+00	
00000000-0000-0000-0000-000000000000	a6db6418-caa0-4345-b228-6d46a3e4f8b9	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 17:43:44.964349+00	
00000000-0000-0000-0000-000000000000	276127cd-2fed-4db0-aefd-b30279a82d16	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 17:43:44.987932+00	
00000000-0000-0000-0000-000000000000	3d3bf399-d380-4c9d-be43-d8e3f7521d87	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 18:42:10.011752+00	
00000000-0000-0000-0000-000000000000	9905db13-1771-4486-8680-13a94b37c0bc	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 18:42:10.027061+00	
00000000-0000-0000-0000-000000000000	e645f354-9407-4f65-92c1-b1b249fdee03	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 21:58:33.208246+00	
00000000-0000-0000-0000-000000000000	9509f4a8-eb85-4045-a57b-91c3939dd7f5	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 21:58:33.226397+00	
00000000-0000-0000-0000-000000000000	a77a3828-3eb2-4929-9c4d-8c343b73187c	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 22:59:10.372771+00	
00000000-0000-0000-0000-000000000000	923ff8ff-d50c-44aa-8730-9f2fe5f0897f	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-24 22:59:10.384669+00	
00000000-0000-0000-0000-000000000000	87bb2645-ffe1-442f-a9a2-284d86d14974	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 00:22:31.354377+00	
00000000-0000-0000-0000-000000000000	19890868-de34-4471-9da4-f8dbbe3537a9	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 00:22:31.368672+00	
00000000-0000-0000-0000-000000000000	e1b0c928-da66-48a0-9a45-3c4f2a5fd23e	{"action":"token_refreshed","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-25 07:05:54.073479+00	
00000000-0000-0000-0000-000000000000	ca4df38f-2e87-48e4-bd0a-d34e31c5d458	{"action":"token_revoked","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-25 07:05:54.095659+00	
00000000-0000-0000-0000-000000000000	343999a3-b56a-4ac7-bda0-97a4c2ff835a	{"action":"login","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-25 07:06:01.946306+00	
00000000-0000-0000-0000-000000000000	dc08e79f-0094-42e3-bd09-a4f3e7e777af	{"action":"logout","actor_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2025-11-25 07:47:50.647559+00	
00000000-0000-0000-0000-000000000000	8aaece39-2907-48b8-a795-9f6898a804d9	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-25 07:47:56.30396+00	
00000000-0000-0000-0000-000000000000	f2817791-b88a-4bcf-94ce-e5ce44cff7bd	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"066c62c6-d68e-45b8-9e4b-130254919ccc","user_phone":""}}	2025-11-25 07:48:21.482562+00	
00000000-0000-0000-0000-000000000000	51ffdb4e-2baa-470f-9639-3013f2156c96	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"c2a8d35c-6b3c-4a4c-be7d-ad2ea35342f1"}}	2025-11-25 07:48:38.718876+00	
00000000-0000-0000-0000-000000000000	5f2dd1fe-ba7b-4eeb-b847-b3fad49b16b4	{"action":"user_signedup","actor_id":"c2a8d35c-6b3c-4a4c-be7d-ad2ea35342f1","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-11-25 07:49:14.747761+00	
00000000-0000-0000-0000-000000000000	d64c51f6-be8b-4398-baa4-32bab35bc8c9	{"action":"user_updated_password","actor_id":"c2a8d35c-6b3c-4a4c-be7d-ad2ea35342f1","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2025-11-25 07:49:26.292434+00	
00000000-0000-0000-0000-000000000000	f6c3b129-cec9-4562-9db7-cd24aa978b67	{"action":"user_modified","actor_id":"c2a8d35c-6b3c-4a4c-be7d-ad2ea35342f1","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2025-11-25 07:49:26.294476+00	
00000000-0000-0000-0000-000000000000	415f883c-5581-4b96-95f3-23a632ffdefb	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-25 07:51:54.776633+00	
00000000-0000-0000-0000-000000000000	5e90b07b-10db-4ca9-9da9-dad0d5f8a3cd	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"c2a8d35c-6b3c-4a4c-be7d-ad2ea35342f1","user_phone":""}}	2025-11-25 07:52:10.168009+00	
00000000-0000-0000-0000-000000000000	17672687-acab-4ab1-b644-84a623a9d55f	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"2727251a-f64b-453f-9e97-62b0c9e9a293"}}	2025-11-25 07:52:30.628553+00	
00000000-0000-0000-0000-000000000000	dffc9ef5-906e-4d51-9d61-255fb2bb43ae	{"action":"user_signedup","actor_id":"2727251a-f64b-453f-9e97-62b0c9e9a293","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-11-25 07:52:47.457512+00	
00000000-0000-0000-0000-000000000000	e132591c-6e9f-47db-85d8-f1ae54c68802	{"action":"user_updated_password","actor_id":"2727251a-f64b-453f-9e97-62b0c9e9a293","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2025-11-25 07:52:57.912585+00	
00000000-0000-0000-0000-000000000000	ed042c8d-ceca-4e02-a694-4b418ed55b5f	{"action":"user_modified","actor_id":"2727251a-f64b-453f-9e97-62b0c9e9a293","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2025-11-25 07:52:57.913326+00	
00000000-0000-0000-0000-000000000000	a0757277-9ef1-43df-b049-e9a16573b662	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 08:29:29.111729+00	
00000000-0000-0000-0000-000000000000	da3c65cb-c7de-4003-bfe3-d9b315e635b8	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 08:29:29.130385+00	
00000000-0000-0000-0000-000000000000	7074890e-c95e-4830-bf71-d5e140499702	{"action":"token_refreshed","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 08:50:18.83752+00	
00000000-0000-0000-0000-000000000000	47f2cebc-ab17-457b-bf0f-cc7f5aefc04c	{"action":"token_revoked","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 08:50:18.857034+00	
00000000-0000-0000-0000-000000000000	ab5874f9-4ea1-45ae-b207-cd288bcfd3a9	{"action":"logout","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-25 08:52:23.617867+00	
00000000-0000-0000-0000-000000000000	87877e72-9861-4c36-9c21-0973596eec80	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-25 08:52:42.454205+00	
00000000-0000-0000-0000-000000000000	6d6736fe-24b9-4ccc-acec-cf756bbfc6bd	{"action":"token_refreshed","actor_id":"2727251a-f64b-453f-9e97-62b0c9e9a293","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-25 08:53:33.280085+00	
00000000-0000-0000-0000-000000000000	0a5e9f0d-6a35-41ff-824b-66f977e22422	{"action":"token_revoked","actor_id":"2727251a-f64b-453f-9e97-62b0c9e9a293","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-25 08:53:33.281254+00	
00000000-0000-0000-0000-000000000000	38bf5e3b-5b41-4524-bf80-93807ba2c938	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"2727251a-f64b-453f-9e97-62b0c9e9a293","user_phone":""}}	2025-11-25 09:18:46.530438+00	
00000000-0000-0000-0000-000000000000	dbb400c7-6c3a-4abb-8fc2-ffb1f320b398	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20"}}	2025-11-25 09:19:16.065351+00	
00000000-0000-0000-0000-000000000000	07d1729c-53f2-48d5-9ac0-2d430a71e70c	{"action":"user_signedup","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-11-25 09:19:26.67326+00	
00000000-0000-0000-0000-000000000000	e29ed1af-6a65-4de0-9183-61cb47bdee4f	{"action":"user_updated_password","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2025-11-25 09:19:37.404711+00	
00000000-0000-0000-0000-000000000000	f0e5d502-d47d-4716-af4e-3baec3b69ab8	{"action":"user_modified","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2025-11-25 09:19:37.405392+00	
00000000-0000-0000-0000-000000000000	73884f68-e42f-4b8a-9826-8e8d6e8b46ac	{"action":"token_refreshed","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 09:50:13.450746+00	
00000000-0000-0000-0000-000000000000	bb615427-a0d4-484a-b638-fcb9264a99f7	{"action":"token_revoked","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 09:50:13.471829+00	
00000000-0000-0000-0000-000000000000	5aa1c1da-2d82-4bd1-af94-0b9b244aca7a	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-25 09:50:52.212762+00	
00000000-0000-0000-0000-000000000000	7f9e1167-73ab-44c9-ac95-1fadf0dd8344	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-25 11:03:56.981896+00	
00000000-0000-0000-0000-000000000000	f2ed41ec-36c3-4da5-99bb-5e0d0e236129	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-25 11:03:57.005958+00	
00000000-0000-0000-0000-000000000000	9ce897f9-03e1-40c2-9ce8-ad3e9e05d31e	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 11:57:12.082892+00	
00000000-0000-0000-0000-000000000000	fbef1a01-2295-4d27-812f-f5a598f87572	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-25 11:57:12.102625+00	
00000000-0000-0000-0000-000000000000	17431bdf-5a94-4e87-9728-cd36d95a2d19	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-25 11:57:21.012109+00	
00000000-0000-0000-0000-000000000000	2330730e-ba70-453b-81d4-0a75453a9e97	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-25 12:02:17.114484+00	
00000000-0000-0000-0000-000000000000	1e68ef95-38f8-4fbf-b8b5-ad41ca1ecdcd	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-25 12:02:17.120882+00	
00000000-0000-0000-0000-000000000000	3327370f-4425-44b0-9f06-5da8e713d0cd	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-26 11:44:17.766465+00	
00000000-0000-0000-0000-000000000000	dd84f5ee-0f63-45e8-97ac-9260d1388991	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 20:10:41.167344+00	
00000000-0000-0000-0000-000000000000	d45b17fb-911a-4bda-a499-a0cf292bc61f	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-26 20:10:41.1875+00	
00000000-0000-0000-0000-000000000000	2127563d-515c-42b1-884a-21543838c197	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-27 00:55:30.533796+00	
00000000-0000-0000-0000-000000000000	0b8aca01-dd06-4b46-868a-eb81f4f88916	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-27 00:55:30.555704+00	
00000000-0000-0000-0000-000000000000	3c738e9b-f5f6-45ca-9ec6-430cc3230d2b	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-27 02:09:25.832809+00	
00000000-0000-0000-0000-000000000000	42a829f2-69e2-45c2-b4b6-2d0e2a57ac43	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-27 02:09:25.849925+00	
00000000-0000-0000-0000-000000000000	d556b25b-0cd5-474a-a288-ab20a8489fee	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-27 02:09:26.016193+00	
00000000-0000-0000-0000-000000000000	3d2a327e-35e9-4d5d-8e95-0e519165aaf3	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-27 03:40:37.914521+00	
00000000-0000-0000-0000-000000000000	f8d4580a-e511-48a8-b362-cf9223390f7e	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-27 07:52:19.402545+00	
00000000-0000-0000-0000-000000000000	5d68c62f-424f-4eb6-a7df-40bef142b606	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-27 07:52:19.418508+00	
00000000-0000-0000-0000-000000000000	01cc5e28-389a-469f-9050-8251ce87fe8d	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-27 07:52:26.228763+00	
00000000-0000-0000-0000-000000000000	d3a6617b-3a9c-4d5d-83a4-d634b23c4043	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-27 08:51:39.930787+00	
00000000-0000-0000-0000-000000000000	4388b3cc-e2b5-4b4f-ab49-bbb6b470977d	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-27 08:51:39.953218+00	
00000000-0000-0000-0000-000000000000	56031e70-14b0-40f1-a352-9d86b8975758	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-27 09:50:09.541573+00	
00000000-0000-0000-0000-000000000000	3d4d19fa-2e49-477d-9aae-cef854a413e3	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-27 09:50:09.561907+00	
00000000-0000-0000-0000-000000000000	d0240a82-0059-4896-929d-a116e2cf6aa6	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-27 11:00:21.982084+00	
00000000-0000-0000-0000-000000000000	cafdfc75-dcb7-44cc-aa35-2359d46b131d	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-27 11:00:22.008211+00	
00000000-0000-0000-0000-000000000000	d890e881-197e-4e67-a5e7-963a1caba09d	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-27 11:58:49.526354+00	
00000000-0000-0000-0000-000000000000	8117217f-686c-4e0c-8dd3-d2651e877650	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-27 11:58:49.555565+00	
00000000-0000-0000-0000-000000000000	4c7f8247-2c64-4cbb-9301-966651f62aef	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-28 05:12:06.632355+00	
00000000-0000-0000-0000-000000000000	3c48eef8-ed49-47b8-b214-fefeeb620140	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-28 05:12:06.652447+00	
00000000-0000-0000-0000-000000000000	461cc9c2-5f79-482e-8985-a34a7947ebf3	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-28 05:12:16.92678+00	
00000000-0000-0000-0000-000000000000	2bd0e62b-c44a-47e6-836a-d1b15deef2a7	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-28 06:10:41.565459+00	
00000000-0000-0000-0000-000000000000	11404373-7a42-47c8-826f-533fb05ef438	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-28 06:10:41.592091+00	
00000000-0000-0000-0000-000000000000	167b390b-c5f5-4d2c-8f7b-beb68d50b299	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-28 07:54:58.162358+00	
00000000-0000-0000-0000-000000000000	99f650d0-1b5b-4285-b00c-335e4e8e5157	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-28 07:54:58.187651+00	
00000000-0000-0000-0000-000000000000	ccdf4bb1-5f6c-4d79-b5f2-a2a88e06cec8	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-28 09:39:39.373685+00	
00000000-0000-0000-0000-000000000000	b1acf3b2-a455-4592-b7b6-5e29c33ccf81	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-28 09:39:39.396284+00	
00000000-0000-0000-0000-000000000000	0898d15f-507c-4e63-afdc-7aa0cdf42cb7	{"action":"logout","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2025-11-28 09:42:18.237462+00	
00000000-0000-0000-0000-000000000000	eba47928-aafc-4078-a429-99c5b2464d01	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-28 09:42:31.193368+00	
00000000-0000-0000-0000-000000000000	338d485c-0627-49ae-b462-e7dce13be76f	{"action":"logout","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-28 09:58:56.451551+00	
00000000-0000-0000-0000-000000000000	36a32c15-6e4a-4af7-991d-000670e9000b	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-28 09:59:03.965053+00	
00000000-0000-0000-0000-000000000000	5a7a4992-b371-40f2-9236-c6e8bd561af0	{"action":"logout","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-28 10:01:16.42206+00	
00000000-0000-0000-0000-000000000000	390a8532-28eb-4e8b-822e-f975c8b78ad1	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-28 10:01:19.666793+00	
00000000-0000-0000-0000-000000000000	a4b10dec-4faf-42ad-9cb5-813fe1cfadf5	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-28 13:02:07.430924+00	
00000000-0000-0000-0000-000000000000	cb6440f9-30da-4829-a8c0-a329783ee2cf	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-28 13:02:07.450689+00	
00000000-0000-0000-0000-000000000000	0f32aef2-b5eb-497d-8a38-7639ac3baf0c	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-28 23:08:04.095734+00	
00000000-0000-0000-0000-000000000000	43dd528b-61c7-44cc-8bc0-7328e9ddd23e	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-29 07:25:53.833191+00	
00000000-0000-0000-0000-000000000000	2be4cb51-e410-4dbb-a04c-c2df0d1f6ead	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-29 19:56:25.524526+00	
00000000-0000-0000-0000-000000000000	afc6f7c8-3fdc-4798-add1-2e89383d530c	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-29 19:56:25.546292+00	
00000000-0000-0000-0000-000000000000	caee606c-b398-45b1-83d5-95f24fb2f3c9	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-29 19:56:48.568419+00	
00000000-0000-0000-0000-000000000000	9bc13539-8f2e-43d5-bf81-f5fbfad71788	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-30 06:26:26.579901+00	
00000000-0000-0000-0000-000000000000	b1d2ad06-a42f-4557-855b-76db357fcbed	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-30 06:26:26.613519+00	
00000000-0000-0000-0000-000000000000	817eb707-7464-40a8-bbc4-9c5e510eb366	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-30 06:26:31.432437+00	
00000000-0000-0000-0000-000000000000	fb4dae7d-ee11-4b9f-98b6-2755dcc394d0	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-30 08:10:28.693984+00	
00000000-0000-0000-0000-000000000000	ae64e6f4-86b6-4da2-9534-f89c0a80f94b	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-30 08:10:28.714494+00	
00000000-0000-0000-0000-000000000000	4c77fa67-25c8-4611-a08f-e48efb7d1629	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-30 09:16:07.588817+00	
00000000-0000-0000-0000-000000000000	768bd0d9-7cf7-407c-84a4-3e7940ce7eb5	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-30 09:16:07.602544+00	
00000000-0000-0000-0000-000000000000	696eb4cd-d2d5-45c1-9ee2-9a90954f3138	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-30 11:19:59.616477+00	
00000000-0000-0000-0000-000000000000	e9338c46-e36b-488c-9a23-b64f482d55cf	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-30 11:19:59.628029+00	
00000000-0000-0000-0000-000000000000	d9acd6f7-1d42-47a6-a06c-73e670221034	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-30 16:24:43.802436+00	
00000000-0000-0000-0000-000000000000	4a6abcec-d8bf-4132-b3c4-32e8c4e3278e	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-30 17:31:58.143612+00	
00000000-0000-0000-0000-000000000000	132801a6-482f-4148-8259-4ff26048b2b4	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-11-30 17:31:58.155424+00	
00000000-0000-0000-0000-000000000000	f29e62ea-8104-4cbb-93f5-378866cf2d2c	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-02 07:18:42.704137+00	
00000000-0000-0000-0000-000000000000	1c52d21b-ecb5-4c46-bd84-f3343272b842	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-02 07:18:42.729589+00	
00000000-0000-0000-0000-000000000000	1b78c028-57b4-4b1d-9d0c-b264f2f581ce	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-02 07:19:15.01578+00	
00000000-0000-0000-0000-000000000000	6cb6b53c-9993-4fc2-bc67-e6f168af4263	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-02 08:51:09.768201+00	
00000000-0000-0000-0000-000000000000	72c66801-08df-4c05-af98-1353f1704ca4	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-02 08:51:09.785494+00	
00000000-0000-0000-0000-000000000000	62c9728c-1bee-473d-8f4c-186c12fbc307	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-02 09:49:09.738344+00	
00000000-0000-0000-0000-000000000000	5f82f962-6b4c-4abe-b672-f708df3e31c9	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-02 09:49:09.756113+00	
00000000-0000-0000-0000-000000000000	4d97e49f-0863-454a-bf82-2c3770669328	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-02 11:12:02.525412+00	
00000000-0000-0000-0000-000000000000	c7ca26ce-1931-4e4f-87d8-f6a008c2f39a	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-02 11:12:02.546747+00	
00000000-0000-0000-0000-000000000000	a0694442-16ee-448e-ad57-15f613a42fc8	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-02 12:32:08.619279+00	
00000000-0000-0000-0000-000000000000	e69fc0c5-ff0c-49f1-b190-91b6c4c187ad	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-02 12:32:08.644404+00	
00000000-0000-0000-0000-000000000000	33fa2cdd-a464-4475-913b-0b56827c37e5	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-02 13:30:23.818683+00	
00000000-0000-0000-0000-000000000000	935d9282-8a99-4e7a-8a2e-5f9682ce27a2	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-02 13:30:23.831438+00	
00000000-0000-0000-0000-000000000000	262043ff-5c4e-4d2d-9e85-01aa009d7fc1	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-05 04:50:56.456123+00	
00000000-0000-0000-0000-000000000000	996c5698-4030-4e88-9b72-159a60f0677c	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-05 04:50:56.477658+00	
00000000-0000-0000-0000-000000000000	d092be80-2219-4a14-b72e-a28ae108ed8d	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-05 05:31:16.515073+00	
00000000-0000-0000-0000-000000000000	e03bad6a-f77c-48e3-9efc-3860ce860bad	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-05 06:29:27.404129+00	
00000000-0000-0000-0000-000000000000	a7dd5e0a-d241-426e-a8c2-41be085d8839	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-05 06:29:27.429189+00	
00000000-0000-0000-0000-000000000000	6223c91d-a55a-4312-b43b-075d382a7c2f	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-05 08:02:42.348455+00	
00000000-0000-0000-0000-000000000000	70c07042-0e68-49f6-8288-9cb8a7d3eb29	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-05 08:02:42.364455+00	
00000000-0000-0000-0000-000000000000	f1f37007-c702-43cc-bba9-fc13c8e6a74f	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-05 09:34:58.965314+00	
00000000-0000-0000-0000-000000000000	c374b6b7-b598-4252-82ca-659cd60fd497	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-05 09:34:58.989745+00	
00000000-0000-0000-0000-000000000000	4defb5df-3d2d-4976-81cd-35fc12dfba7f	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-05 10:33:12.117048+00	
00000000-0000-0000-0000-000000000000	4bb0b1a9-7d9f-4093-938e-1ebdebc8fa19	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-05 10:33:12.144596+00	
00000000-0000-0000-0000-000000000000	f2105c20-aae5-4455-83aa-761711c7d856	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-05 11:46:21.506823+00	
00000000-0000-0000-0000-000000000000	12b2563c-0280-48c8-b2c5-1893531a68d5	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-05 11:46:21.533751+00	
00000000-0000-0000-0000-000000000000	51a3b4db-6e18-45fc-bdb5-f01438455487	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-06 07:56:16.163305+00	
00000000-0000-0000-0000-000000000000	2da1f3f9-ad90-407d-9550-f3b6c3088552	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-06 07:56:16.186832+00	
00000000-0000-0000-0000-000000000000	f9b131af-96fc-4f36-9b3d-f3586ffdee36	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-06 07:56:17.693323+00	
00000000-0000-0000-0000-000000000000	95cee074-864f-4f4a-aa6a-18af623c2931	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-06 08:02:39.918211+00	
00000000-0000-0000-0000-000000000000	634221fa-494f-4617-8c1d-380934fcd442	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-06 08:12:47.19785+00	
00000000-0000-0000-0000-000000000000	b9198e67-8fe3-42fc-9622-5c8f70bdbc77	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-07 06:07:25.181017+00	
00000000-0000-0000-0000-000000000000	cf558470-f875-4042-9a7b-ab19d8f96f5f	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-07 06:07:25.205522+00	
00000000-0000-0000-0000-000000000000	bad85135-269c-44a5-9f22-2147057ddfa8	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-07 06:08:30.86425+00	
00000000-0000-0000-0000-000000000000	3eb11dd4-d544-491b-aa22-882fd14f478d	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-07 07:07:14.337748+00	
00000000-0000-0000-0000-000000000000	95470ab2-6da8-4c6e-a647-bd4687a16bd7	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-07 07:07:14.356823+00	
00000000-0000-0000-0000-000000000000	35ead84c-0c93-4f5e-b9b4-a44720dfd471	{"action":"logout","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2025-12-07 07:07:14.806467+00	
00000000-0000-0000-0000-000000000000	f9d45c31-095e-4248-9963-e15ce1b86545	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-07 07:07:31.98928+00	
00000000-0000-0000-0000-000000000000	c1dc4440-65f8-4fcd-98bc-2e08f1576ef0	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-07 10:15:15.36003+00	
00000000-0000-0000-0000-000000000000	d03a453e-e443-4548-9455-46f0b704afa2	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-07 10:15:15.386139+00	
00000000-0000-0000-0000-000000000000	4f9deb71-f70d-4977-8aa9-06ec50497456	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-07 21:11:19.663513+00	
00000000-0000-0000-0000-000000000000	e6cbe8d4-d704-4469-afe1-cba0c1890f9e	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-07 21:11:19.681292+00	
00000000-0000-0000-0000-000000000000	b2b26a6f-b82c-489b-af76-1a946a57d849	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-08 06:24:38.478684+00	
00000000-0000-0000-0000-000000000000	386ac418-56f2-4344-99c0-9bc3aa62feea	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-08 06:24:38.498614+00	
00000000-0000-0000-0000-000000000000	6128b396-9f4f-4840-82ac-9df131c35bea	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-08 07:48:35.683223+00	
00000000-0000-0000-0000-000000000000	4f222490-7131-413c-a0bd-ca455dad0c22	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-08 07:48:35.692784+00	
00000000-0000-0000-0000-000000000000	8fe14f44-bbce-4715-a386-22cf0df58acb	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-08 07:48:41.169659+00	
00000000-0000-0000-0000-000000000000	544f8657-3860-4d99-bc8d-6ea2f49bc0c8	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-08 08:46:47.023533+00	
00000000-0000-0000-0000-000000000000	ea4a9aa9-e208-4f4d-b6b3-7886ed7e595e	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-08 08:46:47.037347+00	
00000000-0000-0000-0000-000000000000	344d22dd-ddf5-4b57-8559-d270e91894b2	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-08 09:45:15.678024+00	
00000000-0000-0000-0000-000000000000	19699642-f84e-40a5-8f03-e95536d21a73	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-08 09:45:15.703295+00	
00000000-0000-0000-0000-000000000000	dc8f994b-a7dc-4377-bde1-3ce33b5addf4	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-08 11:00:48.044617+00	
00000000-0000-0000-0000-000000000000	db451eb6-f460-4ff0-9d5e-ee49304d2eb8	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-08 11:00:48.066686+00	
00000000-0000-0000-0000-000000000000	1fd6765f-fb0c-4b7a-9e3f-af125a7176ab	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-09 05:52:02.112208+00	
00000000-0000-0000-0000-000000000000	d49c7b02-ed8b-4bbb-8f2f-3daf2ba30005	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-09 05:52:02.138326+00	
00000000-0000-0000-0000-000000000000	e6ee58c4-80b9-43d0-b949-c84e9c192b55	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-09 06:38:48.161576+00	
00000000-0000-0000-0000-000000000000	aa1cc274-fe20-4efc-90b3-1721ed4fcab0	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 06:50:52.820036+00	
00000000-0000-0000-0000-000000000000	c9a06d81-8e3c-49cb-9c83-23784ccfdd63	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 06:50:52.847529+00	
00000000-0000-0000-0000-000000000000	c93ce4b6-3673-442b-81fa-6707384a1f79	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 08:04:31.69187+00	
00000000-0000-0000-0000-000000000000	c702658e-c76f-475d-97ee-9f46d2f0b90c	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 08:04:31.709108+00	
00000000-0000-0000-0000-000000000000	d27acbde-a3d0-4218-bf1d-daa7cdd6d896	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 09:34:32.471626+00	
00000000-0000-0000-0000-000000000000	27f2ce92-b389-4eff-9ce3-2848e66af196	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 09:34:32.486675+00	
00000000-0000-0000-0000-000000000000	90f933aa-5b4c-450d-89e9-89036c64f840	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 09:34:33.227502+00	
00000000-0000-0000-0000-000000000000	714af044-41b6-4ec8-ba5e-9f91d11b18dc	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-11 09:34:46.987505+00	
00000000-0000-0000-0000-000000000000	3c551f3d-5bb1-41fc-8893-53e72d0717ae	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-11 09:56:14.906263+00	
00000000-0000-0000-0000-000000000000	c5e4988c-404b-47d0-947c-6c90bb734ccf	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 10:34:01.940621+00	
00000000-0000-0000-0000-000000000000	635e8c17-e233-4db9-91da-aa3c53863ab6	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 10:34:01.963452+00	
00000000-0000-0000-0000-000000000000	d7a0bd38-8e5d-40dc-a6b3-fae9ff45ed57	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 11:32:22.917031+00	
00000000-0000-0000-0000-000000000000	d0aef80c-dac2-44a2-9511-a0dfd5b5924d	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 11:32:22.938537+00	
00000000-0000-0000-0000-000000000000	f924eee3-08e7-442a-b2dc-3543c208fe06	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 12:30:22.965365+00	
00000000-0000-0000-0000-000000000000	c47b2c69-c6fa-49a9-bb1a-105f7cbe8b92	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 12:30:22.988355+00	
00000000-0000-0000-0000-000000000000	93f3cfbd-e1e8-406f-9184-b83fd9539fed	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 13:28:30.149729+00	
00000000-0000-0000-0000-000000000000	692e85bb-a620-4bb8-90fd-39845ed832db	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 13:28:30.175555+00	
00000000-0000-0000-0000-000000000000	a3cbf2c7-0de9-411e-a814-0bbb788186d4	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 14:26:37.625075+00	
00000000-0000-0000-0000-000000000000	90f1897e-bc15-4ee3-9e32-4b606e607daf	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 14:26:37.653765+00	
00000000-0000-0000-0000-000000000000	dd9fb66a-f21c-49ec-acae-e64ae7f6b591	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 14:30:27.40691+00	
00000000-0000-0000-0000-000000000000	53e55404-f239-4b21-bdd7-58d3491c6ad9	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-11 14:30:27.415396+00	
00000000-0000-0000-0000-000000000000	344425d0-9d46-43bf-92fe-c8d5ac2f3a06	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-11 14:30:47.277089+00	
00000000-0000-0000-0000-000000000000	b81779d6-1712-4134-ad15-3507a2ff4cc8	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-13 16:33:27.388057+00	
00000000-0000-0000-0000-000000000000	2b712c79-e3c2-49e9-81bd-4dc2a109ac48	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-13 23:08:06.562452+00	
00000000-0000-0000-0000-000000000000	037e150c-7994-4346-abb6-929e91ebd466	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-13 23:08:06.586172+00	
00000000-0000-0000-0000-000000000000	5b68c6c9-514d-448c-bc77-6b72f877ea94	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-15 07:21:14.357101+00	
00000000-0000-0000-0000-000000000000	bdb338eb-2825-4e9f-be9e-a7e71a90fd64	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-15 07:21:14.380036+00	
00000000-0000-0000-0000-000000000000	321844af-02ed-4839-92ac-075d037b2be4	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-15 08:47:07.123287+00	
00000000-0000-0000-0000-000000000000	a3f2f3d6-6ff9-4b83-be55-e41e679dce6f	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-15 08:47:07.143918+00	
00000000-0000-0000-0000-000000000000	1bf667b2-762b-4dfb-b524-f37d1d237d46	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-15 10:56:43.712936+00	
00000000-0000-0000-0000-000000000000	e903fdbb-9945-4bd4-afc8-2d9b97b81f30	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-15 10:56:43.734388+00	
00000000-0000-0000-0000-000000000000	a811fce8-e6f7-4de8-a1b7-ea4dd561d7cc	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-15 11:41:17.888221+00	
00000000-0000-0000-0000-000000000000	06d300f6-e067-4452-bf58-1d0e61660332	{"action":"logout","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-12-15 11:41:58.549183+00	
00000000-0000-0000-0000-000000000000	69e2b899-833c-448a-af18-e1f07178fd12	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-15 11:42:01.282835+00	
00000000-0000-0000-0000-000000000000	b385ea41-d843-40f3-98eb-c59c6d8195c4	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-16 16:24:22.280383+00	
00000000-0000-0000-0000-000000000000	4a361ff4-9821-4664-b09a-2b69e3f35bd0	{"action":"logout","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-12-16 16:26:01.198104+00	
00000000-0000-0000-0000-000000000000	24da8b0b-a3bc-4956-8281-fdc43a12d818	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-16 18:13:22.576606+00	
00000000-0000-0000-0000-000000000000	13598fd2-79e8-436f-8d01-95c260af6686	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 19:23:49.604542+00	
00000000-0000-0000-0000-000000000000	7c8d790d-184c-4f37-b796-7ae89d0e4241	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 19:23:49.626752+00	
00000000-0000-0000-0000-000000000000	f3e6eadf-8f69-439a-a957-f199aec97015	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-17 05:23:23.135183+00	
00000000-0000-0000-0000-000000000000	884e3f20-828b-4ce7-9b01-dc67b61f86fb	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-17 05:23:23.16251+00	
00000000-0000-0000-0000-000000000000	a0ffb679-8428-4a1a-8a5b-c45f9082e1c1	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-17 05:55:51.512903+00	
00000000-0000-0000-0000-000000000000	c11a0762-b753-40ba-ae45-07a9e8f8bc86	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-17 06:55:37.380208+00	
00000000-0000-0000-0000-000000000000	55978e72-afd8-4462-8f81-0f822f7b22f2	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-17 06:55:37.402353+00	
00000000-0000-0000-0000-000000000000	8fd8a9c5-8e09-4a9a-bea1-959ed92dacab	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-17 08:12:12.236532+00	
00000000-0000-0000-0000-000000000000	bdb82f8e-dcf6-4a88-8ebd-4209e5c8c17f	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-17 08:12:12.249667+00	
00000000-0000-0000-0000-000000000000	64425830-03e0-4ce0-8e64-138c3f7ccc26	{"action":"logout","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2025-12-17 08:44:01.884933+00	
00000000-0000-0000-0000-000000000000	0d18b87d-4134-41bd-9a21-ffc1c5b1838f	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-17 08:44:07.083693+00	
00000000-0000-0000-0000-000000000000	206f9305-a6eb-4a86-ab49-3bfb87fa218b	{"action":"token_refreshed","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 09:44:06.44708+00	
00000000-0000-0000-0000-000000000000	7f3f4c87-b1f0-4436-b4cb-94bdf28cc668	{"action":"token_revoked","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 09:44:06.477096+00	
00000000-0000-0000-0000-000000000000	4d3ccb98-01cd-48dd-8dee-fabe127a953e	{"action":"logout","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-12-17 09:58:54.89354+00	
00000000-0000-0000-0000-000000000000	0f4807d8-ae1a-4667-903e-b64c357d6f26	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-17 09:59:00.184877+00	
00000000-0000-0000-0000-000000000000	413df3d0-73e0-4a0a-9be5-5d2e05b6233d	{"action":"logout","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2025-12-17 10:45:16.386206+00	
00000000-0000-0000-0000-000000000000	f46c9c79-e221-4589-9435-465bf8ce285c	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-17 10:45:23.580262+00	
00000000-0000-0000-0000-000000000000	8f912945-8826-49c8-8e98-697cc85ef9f1	{"action":"token_refreshed","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 11:43:46.523078+00	
00000000-0000-0000-0000-000000000000	1cb558c1-033b-46b7-a38a-d7e61249ea69	{"action":"token_revoked","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 11:43:46.547525+00	
00000000-0000-0000-0000-000000000000	3736eeae-9ca3-4c13-8029-a6981a6a57c8	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-17 18:08:04.597558+00	
00000000-0000-0000-0000-000000000000	eb0deca6-255e-4806-a276-4ec46622d3b2	{"action":"token_refreshed","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 18:09:20.84048+00	
00000000-0000-0000-0000-000000000000	a8602fa0-ae95-4946-becd-fa61de34e945	{"action":"token_revoked","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-17 18:09:20.846736+00	
00000000-0000-0000-0000-000000000000	e4d984a1-af9a-4015-ae83-e96926aa7d16	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-17 18:09:26.717777+00	
00000000-0000-0000-0000-000000000000	b6d2dde3-4e81-4d18-a8f4-bdca5e2b0026	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 05:14:10.075305+00	
00000000-0000-0000-0000-000000000000	55156d32-0090-4c83-a709-3d2dd2c91507	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 05:14:10.097357+00	
00000000-0000-0000-0000-000000000000	36291d40-c306-40a3-9d40-0382db64a19f	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-18 05:14:15.18234+00	
00000000-0000-0000-0000-000000000000	e4559d8b-c355-4bb4-b57c-eb78030365dc	{"action":"token_refreshed","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-18 05:41:23.511087+00	
00000000-0000-0000-0000-000000000000	b8da7cfe-66d5-4d7d-a004-9ae73390261c	{"action":"token_revoked","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-18 05:41:23.524199+00	
00000000-0000-0000-0000-000000000000	9eb02c39-7373-41f7-af10-432c0aa46a20	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-18 05:41:27.665732+00	
00000000-0000-0000-0000-000000000000	971dfa52-95f7-4361-a71b-aa733a7be253	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-18 06:02:34.71486+00	
00000000-0000-0000-0000-000000000000	48727726-9933-490a-ba96-d37d23a1c298	{"action":"logout","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-12-18 06:02:55.155744+00	
00000000-0000-0000-0000-000000000000	f7fbe7cb-0751-4432-9427-28a0fe42ca98	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-18 06:02:59.917693+00	
00000000-0000-0000-0000-000000000000	982ad654-8a38-4108-aa45-5b4152948f29	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-18 06:43:27.861955+00	
00000000-0000-0000-0000-000000000000	c82a417a-31b3-478f-8ee8-9d6234120ec0	{"action":"logout","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-12-18 06:44:15.285749+00	
00000000-0000-0000-0000-000000000000	a58cb2a3-c52b-4f0e-9a76-749a68a1b5bd	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-18 06:45:19.237941+00	
00000000-0000-0000-0000-000000000000	97949b51-e8b0-4371-83ba-8c4d100dbb0c	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 06:51:37.04687+00	
00000000-0000-0000-0000-000000000000	6a36c611-4690-44b9-bb09-fbdda0d8d3c6	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 06:51:37.05244+00	
00000000-0000-0000-0000-000000000000	7c53d979-ddf3-48a7-8119-8c3e7b1226ad	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-18 06:51:48.262848+00	
00000000-0000-0000-0000-000000000000	adf52134-5471-4f67-8f16-238978dbb9a9	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 07:53:10.740752+00	
00000000-0000-0000-0000-000000000000	3979ac25-6def-40ee-bd78-4f3a0eb79f2e	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 07:53:10.761703+00	
00000000-0000-0000-0000-000000000000	84746800-e00e-44a5-b8c3-c510ff5e9d32	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 09:55:38.438988+00	
00000000-0000-0000-0000-000000000000	52090879-f630-4b02-a048-7e707a884b75	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 09:55:38.455438+00	
00000000-0000-0000-0000-000000000000	af352ae2-11d3-4db4-8754-49ff86b0590f	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 10:54:08.293322+00	
00000000-0000-0000-0000-000000000000	30714022-6838-45e5-9bbc-5553e0f49eda	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 10:54:08.303252+00	
00000000-0000-0000-0000-000000000000	ebfec036-c132-4df5-b90d-0d3c94736290	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 11:52:47.157329+00	
00000000-0000-0000-0000-000000000000	cc30c685-8dcd-4446-bd5b-189bc0b80306	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 11:52:47.181414+00	
00000000-0000-0000-0000-000000000000	a2977050-c53b-455a-be80-8c02d1b9eb62	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 17:25:58.396723+00	
00000000-0000-0000-0000-000000000000	089a20d1-7883-47df-8885-c7190aaaf047	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 17:25:58.423013+00	
00000000-0000-0000-0000-000000000000	9f4e387f-9acc-4b16-9a7e-8c3b150cb04a	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 17:37:08.414659+00	
00000000-0000-0000-0000-000000000000	417d428a-21d6-41dd-8a91-e5fee57a7238	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 17:37:08.42268+00	
00000000-0000-0000-0000-000000000000	44ca9f73-554b-458c-ab6e-ebb635bb0526	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-18 18:49:18.309719+00	
00000000-0000-0000-0000-000000000000	44aa65eb-f33e-46c1-92aa-0e9f29d00a47	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-18 19:00:33.085231+00	
00000000-0000-0000-0000-000000000000	bb5baa17-1bb1-44bb-b244-30a2f87c613f	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 19:47:34.577465+00	
00000000-0000-0000-0000-000000000000	5d927bc6-0c63-4474-9d98-e210f17e73c4	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 19:47:34.593691+00	
00000000-0000-0000-0000-000000000000	3f8cf14f-a72e-4efd-997c-70a634599112	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 21:09:56.049848+00	
00000000-0000-0000-0000-000000000000	57eec215-f5a5-460d-b1a8-dbc3b22d8ca3	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-18 21:09:56.068018+00	
00000000-0000-0000-0000-000000000000	03c2efc9-caf2-414e-8e07-c8619ddfbe58	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-19 07:57:53.082621+00	
00000000-0000-0000-0000-000000000000	be31172a-0f8c-4e56-aa8d-77a6414f4afd	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-19 07:57:53.108752+00	
00000000-0000-0000-0000-000000000000	6cb22947-3d3f-4b60-a69b-82702dcfc6b4	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-19 07:58:39.524848+00	
00000000-0000-0000-0000-000000000000	88969efc-043b-4780-aa69-ebaca3c8bed8	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-19 09:17:12.804068+00	
00000000-0000-0000-0000-000000000000	f1ef872f-0977-4401-a0ca-db491c5439f6	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-19 09:17:12.834868+00	
00000000-0000-0000-0000-000000000000	04c5fddb-59ef-47b7-a06a-1ac6a01a90f1	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-19 10:15:41.949683+00	
00000000-0000-0000-0000-000000000000	ed4d04b2-6d6d-49e3-b39b-34a0076f5769	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-19 10:15:41.968467+00	
00000000-0000-0000-0000-000000000000	d13ec6d7-9edc-4ad4-9420-0d9b6a4d2a65	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-19 11:16:19.5868+00	
00000000-0000-0000-0000-000000000000	7cb70f6f-c9bf-49f4-8ad9-454b689c775f	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-19 11:16:19.600379+00	
00000000-0000-0000-0000-000000000000	3d923b56-e98a-4807-9184-96de894d4058	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-19 11:19:59.400692+00	
00000000-0000-0000-0000-000000000000	1c90ac13-9f42-4199-a618-ecef3d2ee22c	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-19 11:23:09.846015+00	
00000000-0000-0000-0000-000000000000	a6e11747-c10b-4b62-9cea-2d260bf595c0	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-19 11:23:09.84872+00	
00000000-0000-0000-0000-000000000000	cdb1324b-8767-461e-aacd-f79546d211e2	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-19 12:14:39.144201+00	
00000000-0000-0000-0000-000000000000	07fb232e-a5a0-4338-8c99-e21d2666d2b2	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-19 12:14:39.160341+00	
00000000-0000-0000-0000-000000000000	be6bc2ad-0eb7-489b-9341-67d2fd42e226	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-19 12:32:47.12078+00	
00000000-0000-0000-0000-000000000000	e676fc01-e1d8-480f-88dd-80f95136aef5	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-19 13:30:58.712665+00	
00000000-0000-0000-0000-000000000000	5aaea63a-5b05-42fd-8999-e8716d0349bb	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-19 13:30:58.739568+00	
00000000-0000-0000-0000-000000000000	7eda3153-3ef6-4e1a-ae22-dde87c7b99cb	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-21 16:14:27.607886+00	
00000000-0000-0000-0000-000000000000	95ec97bd-9c25-44b9-b4ac-7d30dd8d8b9e	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-21 16:14:27.632255+00	
00000000-0000-0000-0000-000000000000	f1877953-20aa-45ae-a708-238afe3f36ce	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-22 14:30:45.31285+00	
00000000-0000-0000-0000-000000000000	f3cf982e-447f-4da2-91e8-534a4343a90b	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-22 14:30:45.33682+00	
00000000-0000-0000-0000-000000000000	8f7942e4-18fd-49b7-8d8a-be234e4777e6	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-22 16:27:26.475133+00	
00000000-0000-0000-0000-000000000000	6d1e1f19-720e-44e3-bd72-8e98a60b7974	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-22 16:27:26.498312+00	
00000000-0000-0000-0000-000000000000	25bbeed8-ccb3-42a5-b8b1-4bf571cda6ef	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 02:29:23.421498+00	
00000000-0000-0000-0000-000000000000	87b27bd8-819e-4e0f-b88d-5d978d53e6dc	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 02:29:23.439507+00	
00000000-0000-0000-0000-000000000000	b75c82f8-200a-4759-bb97-103b2e9e0634	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 06:23:32.070973+00	
00000000-0000-0000-0000-000000000000	f605905e-c762-491b-8b2e-cb3ccfe26303	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 06:23:32.095888+00	
00000000-0000-0000-0000-000000000000	231c4db5-425e-4a23-97af-23e21e7fa81e	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-23 06:39:53.254012+00	
00000000-0000-0000-0000-000000000000	66e5886c-e756-4abb-873e-48fa067070ec	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 07:38:08.015086+00	
00000000-0000-0000-0000-000000000000	289d8f73-a6fc-4ea4-b372-d1c7bb09b575	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 07:38:08.034141+00	
00000000-0000-0000-0000-000000000000	d80de386-447c-4ea0-8ec6-710eb34a48b3	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 08:36:30.552048+00	
00000000-0000-0000-0000-000000000000	4470c5b2-c6c0-4ae2-9005-18022422ac4f	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 08:36:30.57447+00	
00000000-0000-0000-0000-000000000000	61616a58-cb58-4e0e-94cb-2eb93d6d70ca	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 09:34:45.675658+00	
00000000-0000-0000-0000-000000000000	391beb9a-72c9-48d4-a987-703edfa3ae07	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 09:34:45.696283+00	
00000000-0000-0000-0000-000000000000	3871d28c-7517-4fd0-a223-7d5a46744e92	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 10:32:59.563951+00	
00000000-0000-0000-0000-000000000000	88b0868d-dbf1-44cf-8ed9-febf5449ba23	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 10:32:59.587716+00	
00000000-0000-0000-0000-000000000000	978c4d5e-2281-4dbc-945f-17002d32476a	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 11:31:22.05379+00	
00000000-0000-0000-0000-000000000000	ab56ec3a-9653-4ef5-a0e4-884fd924d0ee	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 11:31:22.080715+00	
00000000-0000-0000-0000-000000000000	6a78755e-fbe3-4a90-b7b9-0cca8b442847	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 12:31:50.954839+00	
00000000-0000-0000-0000-000000000000	db59bae9-212a-4b44-ba64-634aea91ff6e	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 12:31:50.969208+00	
00000000-0000-0000-0000-000000000000	02b567fa-632c-43d0-8a25-8369a1c39f76	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 16:22:24.002265+00	
00000000-0000-0000-0000-000000000000	4ec779e2-b428-4854-ab8f-bdd7912b0aab	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 16:22:24.02364+00	
00000000-0000-0000-0000-000000000000	c384d891-1366-43b7-b485-98548d6d1b74	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 19:04:17.635424+00	
00000000-0000-0000-0000-000000000000	fe1569b7-188e-4e13-8076-a5696ce443e7	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-23 19:04:17.650694+00	
00000000-0000-0000-0000-000000000000	3cb11f2b-be92-474d-9ef0-88b9ed064b6b	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 08:47:38.759179+00	
00000000-0000-0000-0000-000000000000	2cd48455-0ca0-4ab6-bab5-c505f39c9fc6	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 08:47:38.785198+00	
00000000-0000-0000-0000-000000000000	fd8672ea-6612-441f-b5fc-aec8c062fd0a	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-24 08:47:47.281411+00	
00000000-0000-0000-0000-000000000000	78c39ce1-14c9-41a4-8878-9c2ea0c9ca55	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 09:53:18.632214+00	
00000000-0000-0000-0000-000000000000	6b4dda9f-dc18-4278-ac1b-d1b73793099f	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 09:53:18.649645+00	
00000000-0000-0000-0000-000000000000	2f9fff40-63ff-4a79-b503-f823aaa0b5b8	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-24 09:55:00.626735+00	
00000000-0000-0000-0000-000000000000	22c21397-9034-4162-a7e1-ff6329764f93	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-24 10:29:53.555967+00	
00000000-0000-0000-0000-000000000000	bc71dc91-74ed-4cd9-bc26-49f1f170265a	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-24 10:32:20.408073+00	
00000000-0000-0000-0000-000000000000	e6ba8445-a0cc-4341-a4b1-50a220589621	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-24 10:33:13.696772+00	
00000000-0000-0000-0000-000000000000	6ccdff56-7e84-4df7-909f-4b40bab63482	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 10:53:11.420649+00	
00000000-0000-0000-0000-000000000000	3c794bf8-d874-47ff-929f-f0a55b6c4410	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 10:53:11.432965+00	
00000000-0000-0000-0000-000000000000	b8101be2-abea-428e-b885-00c3d06ee1d2	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 11:31:28.472257+00	
00000000-0000-0000-0000-000000000000	5b03c517-8a86-4bfc-887a-8afb9431aeae	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 11:31:28.486722+00	
00000000-0000-0000-0000-000000000000	807a3f12-fcf0-48e0-baab-67340f30457c	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 11:51:31.524718+00	
00000000-0000-0000-0000-000000000000	fce9074f-5cc2-47e1-b9d5-ab480a5b8a14	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 11:51:31.538417+00	
00000000-0000-0000-0000-000000000000	eeea651c-1942-43a9-86ac-c9c5751f5a70	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 12:00:12.987768+00	
00000000-0000-0000-0000-000000000000	cd83d200-e275-4ca7-b8f1-e62454790f79	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 12:00:13.002596+00	
00000000-0000-0000-0000-000000000000	be7fa1eb-8ba3-4a6e-8334-dfd7e1b1382e	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-24 12:00:16.180065+00	
00000000-0000-0000-0000-000000000000	6f6e642d-c3bc-4e0b-881c-f672b19c2642	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 12:29:58.292363+00	
00000000-0000-0000-0000-000000000000	a1661a1f-98a2-41d4-bc49-4cdb591537d8	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 12:29:58.305567+00	
00000000-0000-0000-0000-000000000000	8566c6ff-0ddf-4440-85af-517b24ddae54	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-24 12:32:39.618182+00	
00000000-0000-0000-0000-000000000000	e7f2e9a9-4f78-4d9f-9c90-797012d7ba81	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 12:49:44.22793+00	
00000000-0000-0000-0000-000000000000	d13c620e-40ca-4777-9f97-2f8c89ea2027	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 12:49:44.238104+00	
00000000-0000-0000-0000-000000000000	ef830596-251c-4075-9bad-1cc3c7d7d1c0	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 13:28:28.792292+00	
00000000-0000-0000-0000-000000000000	1cba40d4-7c20-48bd-84c6-e4112cddf886	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 13:28:28.822413+00	
00000000-0000-0000-0000-000000000000	4fc4b3b4-6f97-49af-b3bc-1d97522dd168	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 13:58:37.036137+00	
00000000-0000-0000-0000-000000000000	1d800049-1cb1-4672-887b-6387f76b2540	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 13:58:37.055139+00	
00000000-0000-0000-0000-000000000000	8eabdffb-9b04-4fe4-b92f-785473a56645	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 14:26:58.341482+00	
00000000-0000-0000-0000-000000000000	220697cc-6bc3-4216-99b6-6207d96afb1e	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 14:26:58.357088+00	
00000000-0000-0000-0000-000000000000	c337e887-5635-4aff-aae5-178068467bac	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 15:04:27.374232+00	
00000000-0000-0000-0000-000000000000	4f45e945-b644-4c6d-bfa9-5940986e578a	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 15:04:27.394262+00	
00000000-0000-0000-0000-000000000000	714876ab-461e-4d4d-a163-9860c9cd19c4	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 15:25:27.952939+00	
00000000-0000-0000-0000-000000000000	4a0d12aa-930b-4454-8564-3bbf7937a3bd	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 15:25:27.968234+00	
00000000-0000-0000-0000-000000000000	242a0a36-7475-41e9-9597-3e3a35bb3311	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 15:32:13.895121+00	
00000000-0000-0000-0000-000000000000	a6c3b3b5-d993-4a91-a28d-406f8d00be8d	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 15:32:13.910839+00	
00000000-0000-0000-0000-000000000000	db0b74e7-9b1d-4715-9f52-79e072dcd86c	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 16:11:40.257437+00	
00000000-0000-0000-0000-000000000000	96436593-d4e9-472f-b87f-b66d49f9ab96	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 16:11:40.267738+00	
00000000-0000-0000-0000-000000000000	4802bab6-427e-4b40-a209-5c344e9ca6c9	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-24 16:14:35.096098+00	
00000000-0000-0000-0000-000000000000	7efcee35-743d-46be-9d45-cabb274c435f	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 16:56:02.211941+00	
00000000-0000-0000-0000-000000000000	6c8fe2d3-ecf1-4aa1-ac9d-86b69e97cb95	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 16:56:02.237025+00	
00000000-0000-0000-0000-000000000000	47b3764d-e7b8-433f-8f2f-df3eaaee63cf	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-24 17:09:17.182551+00	
00000000-0000-0000-0000-000000000000	a9999c8e-b54f-41a5-98dc-b4d9c72c3879	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 17:18:23.338986+00	
00000000-0000-0000-0000-000000000000	0ed811b9-2bdd-4345-a46c-140bc7659cd6	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 17:18:23.351933+00	
00000000-0000-0000-0000-000000000000	bf2eeda7-ed75-4140-9f94-2338ef21760e	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 18:39:38.261424+00	
00000000-0000-0000-0000-000000000000	d18a56e8-32d2-4499-b423-4d4953a4ac31	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-24 18:39:38.278247+00	
00000000-0000-0000-0000-000000000000	b66d3728-83c9-49b6-a1f8-d34336c0c447	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-25 13:45:15.405752+00	
00000000-0000-0000-0000-000000000000	e2b84509-71a5-4a90-b251-2e535ffe6761	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-25 13:45:15.432064+00	
00000000-0000-0000-0000-000000000000	e386be85-1a3d-49a6-8eb1-ebac1923dbee	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-25 13:48:17.854054+00	
00000000-0000-0000-0000-000000000000	e8dcb846-2855-4496-8684-a99541aa3824	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-25 14:46:23.465719+00	
00000000-0000-0000-0000-000000000000	eb69bbe9-8bce-4a59-b131-2455bf02436d	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-25 14:46:23.479462+00	
00000000-0000-0000-0000-000000000000	d3ffe120-f4c9-4437-b80b-555ea0032d60	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-25 17:43:43.209977+00	
00000000-0000-0000-0000-000000000000	c99920d6-5c86-47be-8807-4201635a56c5	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-25 17:43:43.230713+00	
00000000-0000-0000-0000-000000000000	782c5523-4ee1-4d8a-afcc-82e20f55b49e	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-26 00:33:49.940823+00	
00000000-0000-0000-0000-000000000000	e1aa2c08-e011-41ff-af40-f304bcccbaff	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-26 00:33:49.954315+00	
00000000-0000-0000-0000-000000000000	07e07c32-6ea3-4afb-b7b8-784046e59c6c	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-26 00:33:52.83396+00	
00000000-0000-0000-0000-000000000000	b7e24eed-bdf8-44b9-99c5-0ade0d9a997b	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-26 12:45:29.569866+00	
00000000-0000-0000-0000-000000000000	63dc8431-de3c-4d65-b7f9-a824dfd24d86	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-26 12:45:29.594262+00	
00000000-0000-0000-0000-000000000000	e869f242-9cc1-4b00-9de2-2647c98b31d0	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-26 17:15:45.974127+00	
00000000-0000-0000-0000-000000000000	237fca45-91ff-4134-a6a6-ac4054052fd4	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-26 17:15:45.99299+00	
00000000-0000-0000-0000-000000000000	5c1841ce-3d6e-4a07-b766-184e5a046ae1	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-26 17:15:52.912456+00	
00000000-0000-0000-0000-000000000000	65e2c239-871a-46c4-9a62-dfe3e4a63b7f	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-26 17:38:17.50027+00	
00000000-0000-0000-0000-000000000000	a3c8a3c9-affe-49fe-899f-7b1b267e8dbb	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-26 18:53:25.52776+00	
00000000-0000-0000-0000-000000000000	6327503b-bae0-49de-a2c6-8967ccd211c7	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-26 18:53:25.547448+00	
00000000-0000-0000-0000-000000000000	a024ad75-b39d-425c-b0e7-6549bb12149e	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-30 20:30:54.701078+00	
00000000-0000-0000-0000-000000000000	f519b372-de37-40b0-a4c1-e6047badac2c	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-30 20:30:54.729138+00	
00000000-0000-0000-0000-000000000000	eb4bc58a-745f-4281-80a0-040413d19513	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-30 20:43:15.805424+00	
00000000-0000-0000-0000-000000000000	9b5ce3f2-e30a-4691-a5c4-fdf99baa2ce6	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-31 02:43:53.865183+00	
00000000-0000-0000-0000-000000000000	600e93da-ede1-4c91-8784-1f442bde939e	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-31 02:43:53.888407+00	
00000000-0000-0000-0000-000000000000	060374e6-2a5e-4bdd-887c-d64f0d956cb9	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-31 04:29:45.820226+00	
00000000-0000-0000-0000-000000000000	9c1a5a13-aeee-4b10-b49f-21f092978a81	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-31 04:29:45.847166+00	
00000000-0000-0000-0000-000000000000	900db0b0-90db-4b92-8a30-b831ca842a9b	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-31 05:32:11.24624+00	
00000000-0000-0000-0000-000000000000	5999734b-7293-435e-bf61-4f3fd7c43a91	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-31 05:32:11.259524+00	
00000000-0000-0000-0000-000000000000	014505e7-b648-4ad9-8a2a-270f764253ec	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-31 06:26:47.264351+00	
00000000-0000-0000-0000-000000000000	6f6cf1ec-b112-435f-8b64-7246a9de56c0	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-31 17:06:13.925205+00	
00000000-0000-0000-0000-000000000000	90840dd6-edd1-4bd2-9560-431391943f15	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-31 17:06:13.952599+00	
00000000-0000-0000-0000-000000000000	4fd2eb64-1d71-4ee4-a217-9b69032332d6	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-31 18:58:56.761194+00	
00000000-0000-0000-0000-000000000000	94c1175b-b68b-4d19-a3a8-ce0a0e6daf2c	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-31 18:58:56.774686+00	
00000000-0000-0000-0000-000000000000	4c635949-2661-4f18-ac36-f092f3c5053d	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-31 20:33:15.588015+00	
00000000-0000-0000-0000-000000000000	5cca091f-e4cd-48cc-b346-57e7aaeac372	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2025-12-31 20:33:15.600397+00	
00000000-0000-0000-0000-000000000000	52b4e42f-1a59-4337-b294-ea5bb108c227	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-01 00:53:38.646038+00	
00000000-0000-0000-0000-000000000000	c1c93d37-cd24-43b4-8974-cfca0c185504	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-01 00:53:38.667884+00	
00000000-0000-0000-0000-000000000000	e1197e81-ebeb-46f4-8316-0c7a7b9d0e95	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-01 14:42:01.750425+00	
00000000-0000-0000-0000-000000000000	2f30fcb3-6123-4e65-b2bf-a219aef34c4e	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-01 14:42:01.774501+00	
00000000-0000-0000-0000-000000000000	f2ae349a-54da-4416-bec2-57d3560cd6d0	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-05 02:41:45.22487+00	
00000000-0000-0000-0000-000000000000	c9392318-5324-4772-8ff7-55d5e87cba8d	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-05 02:41:45.256383+00	
00000000-0000-0000-0000-000000000000	ee62b721-a16e-4558-9b08-dd5d206a9f5b	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-05 02:41:48.89498+00	
00000000-0000-0000-0000-000000000000	ecc75053-7ae5-431b-a417-a38a95456fe7	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-05 02:43:12.961091+00	
00000000-0000-0000-0000-000000000000	16b8a13e-12f6-41e2-9077-55a5d5cefc8b	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-06 08:44:09.013582+00	
00000000-0000-0000-0000-000000000000	fefcbe61-b2bf-44d5-8b36-ad97d9a13c14	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-06 08:44:09.036798+00	
00000000-0000-0000-0000-000000000000	40b1c687-813e-4b0e-993c-57031459e42e	{"action":"login","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 08:49:22.632104+00	
00000000-0000-0000-0000-000000000000	50984ce8-db75-4c05-9b66-bf0e1a19fa6d	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 08:51:21.287236+00	
00000000-0000-0000-0000-000000000000	f1663059-d9e5-48d4-846a-2ced94fcce08	{"action":"logout","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-01-06 08:51:55.809662+00	
00000000-0000-0000-0000-000000000000	8e2a6dde-c191-4fec-b4cd-c33eb2b9196f	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 08:55:47.304864+00	
00000000-0000-0000-0000-000000000000	daf997e5-dafc-4df2-b12e-5ba252d823b9	{"action":"logout","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-01-06 08:59:31.170391+00	
00000000-0000-0000-0000-000000000000	2b4eb5e5-4843-4889-ab48-70a3ca409e4a	{"action":"login","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 08:59:35.158367+00	
00000000-0000-0000-0000-000000000000	2c663bd0-dc2b-4cc3-a3d0-e652f63be509	{"action":"token_refreshed","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-06 09:47:27.092979+00	
00000000-0000-0000-0000-000000000000	0142dd9e-67e2-4441-86e5-3be73cb41bea	{"action":"token_revoked","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-06 09:47:27.119625+00	
00000000-0000-0000-0000-000000000000	63657209-0258-4099-9b26-638f60bbf984	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-06 09:57:47.062956+00	
00000000-0000-0000-0000-000000000000	46bb9797-66e7-4d92-a9cc-4068a49f67e8	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-06 09:57:47.071567+00	
00000000-0000-0000-0000-000000000000	56deed40-8f63-4aa1-aa95-ed5b827e637d	{"action":"token_refreshed","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-06 10:56:01.160248+00	
00000000-0000-0000-0000-000000000000	d5fab599-b484-4748-9724-1292e441d104	{"action":"token_revoked","actor_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-06 10:56:01.174115+00	
00000000-0000-0000-0000-000000000000	204c6674-9926-4a4a-bac4-234f5ef737e8	{"action":"token_refreshed","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-06 10:58:09.23866+00	
00000000-0000-0000-0000-000000000000	f2db5f94-b41e-4145-86c8-9dc138c02bf9	{"action":"token_revoked","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-06 10:58:09.245691+00	
00000000-0000-0000-0000-000000000000	e8a78bc9-1adf-465d-bf31-5fe26a960fc8	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 11:34:39.051852+00	
00000000-0000-0000-0000-000000000000	3fdce853-0f24-426a-beef-522b417e7555	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"e17c3bdb-9fe9-4f2b-bb0b-26425e825b20","user_phone":""}}	2026-01-06 11:35:08.25655+00	
00000000-0000-0000-0000-000000000000	f7736544-e3bd-47bb-bced-5b5fa2aedfcc	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"f647813a-db81-4dc5-9987-659a70ec5c32"}}	2026-01-06 11:35:08.585579+00	
00000000-0000-0000-0000-000000000000	60365aa6-93bf-4969-96ee-bcc3af634361	{"action":"logout","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-01-06 11:37:07.195822+00	
00000000-0000-0000-0000-000000000000	89b6bce3-c0b6-4246-9b05-bcc603b15582	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 11:37:38.160435+00	
00000000-0000-0000-0000-000000000000	030418c7-1513-43d0-ae04-4021091341b9	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"f647813a-db81-4dc5-9987-659a70ec5c32","user_phone":""}}	2026-01-06 11:38:16.153363+00	
00000000-0000-0000-0000-000000000000	936c969e-0b09-4d13-a0af-d5eaa516d93c	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"5e081d28-95c2-41b2-8735-c7b863273773"}}	2026-01-06 11:38:45.762995+00	
00000000-0000-0000-0000-000000000000	e631daed-113f-42c5-80ba-240dce93ed9d	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l226704@lhr.nu.edu.pk","user_id":"f4813fd2-f4dc-4f63-8e83-b4aec463fbdc"}}	2026-01-06 11:40:37.698869+00	
00000000-0000-0000-0000-000000000000	9ae2c2df-cd24-45e1-bd07-37788df3b4d4	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"5e081d28-95c2-41b2-8735-c7b863273773","user_phone":""}}	2026-01-06 11:53:48.428686+00	
00000000-0000-0000-0000-000000000000	84a3d75a-d20a-456b-8fe1-5b16e4787d24	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"1e2a24ee-2903-4c72-a355-1443e3225210"}}	2026-01-06 11:53:48.727236+00	
00000000-0000-0000-0000-000000000000	9c28f955-2522-43ba-b21a-f4c986f3ae74	{"action":"login","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 11:56:40.726987+00	
00000000-0000-0000-0000-000000000000	2d261c3b-0320-42f1-a21a-b11f3ca958e4	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"1e2a24ee-2903-4c72-a355-1443e3225210","user_phone":""}}	2026-01-06 11:57:16.865389+00	
00000000-0000-0000-0000-000000000000	d2b31efd-d4de-4b1f-b1ce-38ade415efa0	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"d0ec8ecb-a64c-4f4f-a3e1-f08a829ac7ae"}}	2026-01-06 11:57:17.703373+00	
00000000-0000-0000-0000-000000000000	c9e8714e-6871-441e-a3d9-91fee5536388	{"action":"user_signedup","actor_id":"d0ec8ecb-a64c-4f4f-a3e1-f08a829ac7ae","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-06 12:02:18.787785+00	
00000000-0000-0000-0000-000000000000	a399cca0-e366-4b17-b6ec-6de84957cb35	{"action":"logout","actor_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-01-06 12:03:40.708504+00	
00000000-0000-0000-0000-000000000000	955027c5-8454-4f67-a08b-e2eb21eead64	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"d0ec8ecb-a64c-4f4f-a3e1-f08a829ac7ae","user_phone":""}}	2026-01-06 12:04:09.545656+00	
00000000-0000-0000-0000-000000000000	3632bac1-c92d-4a0c-a533-b1cfbb6ad35f	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"4230b3bd-b85e-404e-a87d-b3b106fa69a9"}}	2026-01-06 12:04:25.760885+00	
00000000-0000-0000-0000-000000000000	4270f783-1a95-4790-a0da-eab913d5922c	{"action":"user_signedup","actor_id":"4230b3bd-b85e-404e-a87d-b3b106fa69a9","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-06 12:04:48.861507+00	
00000000-0000-0000-0000-000000000000	b589f2e8-b68e-48de-a4ff-5dd847c942bb	{"action":"user_updated_password","actor_id":"4230b3bd-b85e-404e-a87d-b3b106fa69a9","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 12:05:02.469924+00	
00000000-0000-0000-0000-000000000000	802894f0-dac0-4acc-b293-739e874b089e	{"action":"user_modified","actor_id":"4230b3bd-b85e-404e-a87d-b3b106fa69a9","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 12:05:02.470674+00	
00000000-0000-0000-0000-000000000000	0171e063-9a35-44b2-ac2f-a147d1503008	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"4230b3bd-b85e-404e-a87d-b3b106fa69a9","user_phone":""}}	2026-01-06 12:16:56.205177+00	
00000000-0000-0000-0000-000000000000	186b80ad-34a7-48d5-a664-1ea06c6ec908	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"aac363cd-f701-406d-aea6-5f6379f36c9b"}}	2026-01-06 12:17:07.956865+00	
00000000-0000-0000-0000-000000000000	56737d07-c527-484f-9745-5b2aef92e518	{"action":"user_signedup","actor_id":"aac363cd-f701-406d-aea6-5f6379f36c9b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-06 12:17:27.444647+00	
00000000-0000-0000-0000-000000000000	76089e92-fbc1-4314-9f95-e6ac2a2145ce	{"action":"user_updated_password","actor_id":"aac363cd-f701-406d-aea6-5f6379f36c9b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 12:17:35.501034+00	
00000000-0000-0000-0000-000000000000	18b78035-a984-40be-bcef-352504b4c196	{"action":"user_modified","actor_id":"aac363cd-f701-406d-aea6-5f6379f36c9b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 12:17:35.501735+00	
00000000-0000-0000-0000-000000000000	52eb1f85-5c9a-48cb-9bf4-9226de29e792	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-07 11:57:52.792485+00	
00000000-0000-0000-0000-000000000000	0e27bccf-52d7-422e-a5cc-525cafb2ac07	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"aac363cd-f701-406d-aea6-5f6379f36c9b","user_phone":""}}	2026-01-06 12:19:34.473562+00	
00000000-0000-0000-0000-000000000000	a37f9dd8-fe1a-42f0-aab3-22e51c217943	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"545728b5-b28d-47b0-bd56-cb85f13a0c6a"}}	2026-01-06 12:20:40.997725+00	
00000000-0000-0000-0000-000000000000	ee823dbe-60ab-49ff-8934-8175f4d37892	{"action":"user_signedup","actor_id":"545728b5-b28d-47b0-bd56-cb85f13a0c6a","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-06 12:20:54.96184+00	
00000000-0000-0000-0000-000000000000	f582b2a2-35b0-4e00-981f-9b9c8dff9aaf	{"action":"user_updated_password","actor_id":"545728b5-b28d-47b0-bd56-cb85f13a0c6a","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 12:21:01.574797+00	
00000000-0000-0000-0000-000000000000	d866cf2a-a590-4ce0-ae8b-e05a6e159612	{"action":"user_modified","actor_id":"545728b5-b28d-47b0-bd56-cb85f13a0c6a","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 12:21:01.578902+00	
00000000-0000-0000-0000-000000000000	7650848a-9aea-4197-ad22-255f6de14c3f	{"action":"token_refreshed","actor_id":"545728b5-b28d-47b0-bd56-cb85f13a0c6a","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-06 13:19:28.518219+00	
00000000-0000-0000-0000-000000000000	c226300f-d91b-4563-8394-a7f3dd36d364	{"action":"token_revoked","actor_id":"545728b5-b28d-47b0-bd56-cb85f13a0c6a","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-06 13:19:28.547643+00	
00000000-0000-0000-0000-000000000000	dd370eff-6428-42eb-bc20-3c230d58574b	{"action":"login","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 13:31:14.837742+00	
00000000-0000-0000-0000-000000000000	6d07b0ba-1a9e-4e35-85da-6add84873422	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"rabiuddin1@gmail.com","user_id":"30fd9df9-1507-40f5-b482-23fce1fc7dab","user_phone":""}}	2026-01-06 13:31:45.349578+00	
00000000-0000-0000-0000-000000000000	56be0cac-9f6f-4f3a-83fb-99f7e24276a7	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"rabiuddin1@gmail.com","user_id":"5b9e6608-d66e-4659-b203-235596e312fd"}}	2026-01-06 13:31:45.778636+00	
00000000-0000-0000-0000-000000000000	0996f617-e559-4a15-8b9f-7aad6b72d317	{"action":"user_signedup","actor_id":"5b9e6608-d66e-4659-b203-235596e312fd","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-06 13:32:07.476984+00	
00000000-0000-0000-0000-000000000000	33324a3e-ccee-4da3-8630-548000b843d8	{"action":"user_updated_password","actor_id":"5b9e6608-d66e-4659-b203-235596e312fd","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"user"}	2026-01-06 13:32:16.95692+00	
00000000-0000-0000-0000-000000000000	76a8a0a0-6a34-42fb-8f76-c8b378b12018	{"action":"user_modified","actor_id":"5b9e6608-d66e-4659-b203-235596e312fd","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"user"}	2026-01-06 13:32:16.958325+00	
00000000-0000-0000-0000-000000000000	a01725c5-220d-43a9-b31f-4598fad25e01	{"action":"login","actor_id":"5b9e6608-d66e-4659-b203-235596e312fd","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 13:32:41.028839+00	
00000000-0000-0000-0000-000000000000	623b153e-6655-4c63-a895-638278baf646	{"action":"login","actor_id":"5b9e6608-d66e-4659-b203-235596e312fd","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 13:33:12.481704+00	
00000000-0000-0000-0000-000000000000	19064d87-0dba-4653-a3c7-ef339878231c	{"action":"login","actor_id":"545728b5-b28d-47b0-bd56-cb85f13a0c6a","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 13:34:28.463029+00	
00000000-0000-0000-0000-000000000000	239f84b1-1ac0-4ce1-92c2-e52f6cda555d	{"action":"logout","actor_id":"545728b5-b28d-47b0-bd56-cb85f13a0c6a","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-01-06 13:34:46.040543+00	
00000000-0000-0000-0000-000000000000	1b994d5c-3dbe-40ea-9a49-53864b0b9f9a	{"action":"login","actor_id":"5b9e6608-d66e-4659-b203-235596e312fd","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 13:35:17.197267+00	
00000000-0000-0000-0000-000000000000	7e4912e6-777d-4b15-bfc0-afe64d4016b8	{"action":"login","actor_id":"5b9e6608-d66e-4659-b203-235596e312fd","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 13:35:57.126875+00	
00000000-0000-0000-0000-000000000000	abce0fe4-2161-4833-88ab-718a6cb0cd25	{"action":"login","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 13:39:19.377212+00	
00000000-0000-0000-0000-000000000000	1551b87b-63f8-4550-81f6-819674088a19	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"rabiuddin1@gmail.com","user_id":"5b9e6608-d66e-4659-b203-235596e312fd","user_phone":""}}	2026-01-06 13:39:50.26231+00	
00000000-0000-0000-0000-000000000000	9c3b28a6-9738-4a33-9116-08088589bece	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"rabiuddin1@gmail.com","user_id":"0b4699a1-8ed6-48ef-ab24-641573258ce9"}}	2026-01-06 13:39:50.624914+00	
00000000-0000-0000-0000-000000000000	16856a28-037a-48eb-8e50-8fadf99872c1	{"action":"user_signedup","actor_id":"0b4699a1-8ed6-48ef-ab24-641573258ce9","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-06 13:40:48.113853+00	
00000000-0000-0000-0000-000000000000	e81be320-5c47-4789-a3f6-1a776ebd711c	{"action":"user_updated_password","actor_id":"0b4699a1-8ed6-48ef-ab24-641573258ce9","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"user"}	2026-01-06 13:40:59.732323+00	
00000000-0000-0000-0000-000000000000	9357eef1-f926-4b91-8303-8e90bd504e2f	{"action":"user_modified","actor_id":"0b4699a1-8ed6-48ef-ab24-641573258ce9","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"user"}	2026-01-06 13:40:59.734693+00	
00000000-0000-0000-0000-000000000000	728325a0-200d-4cb2-a947-d9484ed3e359	{"action":"login","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 13:41:58.814422+00	
00000000-0000-0000-0000-000000000000	1bd34fb8-b66b-4d63-a11b-b0f93ca97a70	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"rabiuddin1@gmail.com","user_id":"0b4699a1-8ed6-48ef-ab24-641573258ce9","user_phone":""}}	2026-01-06 13:42:20.967969+00	
00000000-0000-0000-0000-000000000000	691411ba-d767-4cbb-8cd8-0d56ad8a82d7	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"rabiuddin1@gmail.com","user_id":"47608636-5d49-4318-ae28-b02f87dda535"}}	2026-01-06 13:42:21.259605+00	
00000000-0000-0000-0000-000000000000	89e2f1b1-f942-4135-b72e-948350d09d72	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"rabiuddin1@gmail.com","user_id":"47608636-5d49-4318-ae28-b02f87dda535","user_phone":""}}	2026-01-06 13:42:33.858501+00	
00000000-0000-0000-0000-000000000000	62b1d805-28d4-49c3-bf56-ac700c64c425	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"rabiuddin1@gmail.com","user_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06"}}	2026-01-06 13:43:00.464561+00	
00000000-0000-0000-0000-000000000000	62195850-d75d-4ea2-966e-1673971eee07	{"action":"user_signedup","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-06 13:43:21.174742+00	
00000000-0000-0000-0000-000000000000	ed522e3a-b94f-41f6-8297-6a7a6e8b36fb	{"action":"user_updated_password","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"user"}	2026-01-06 13:43:30.851755+00	
00000000-0000-0000-0000-000000000000	ad44f399-2bec-4506-9087-aa47381b7398	{"action":"user_modified","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"user"}	2026-01-06 13:43:30.856266+00	
00000000-0000-0000-0000-000000000000	cc0729fc-1efb-4334-a1c3-cc5e22eae66c	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"545728b5-b28d-47b0-bd56-cb85f13a0c6a","user_phone":""}}	2026-01-06 13:44:11.047902+00	
00000000-0000-0000-0000-000000000000	fdd962ce-87a5-41fb-8a0a-9b394d121f9c	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"3f59c423-e6b5-499d-b5a3-67391b76fe48"}}	2026-01-06 13:44:11.384751+00	
00000000-0000-0000-0000-000000000000	535b4c1d-b961-474b-9556-eb4ba352abc4	{"action":"user_signedup","actor_id":"3f59c423-e6b5-499d-b5a3-67391b76fe48","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-06 13:44:23.138181+00	
00000000-0000-0000-0000-000000000000	6d6b6466-4d95-48ea-9fbe-1efbf705a3ca	{"action":"user_updated_password","actor_id":"3f59c423-e6b5-499d-b5a3-67391b76fe48","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 13:44:31.25563+00	
00000000-0000-0000-0000-000000000000	62936d8f-1e09-4459-bab0-64b0d7cba133	{"action":"user_modified","actor_id":"3f59c423-e6b5-499d-b5a3-67391b76fe48","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 13:44:31.257637+00	
00000000-0000-0000-0000-000000000000	76a7a40e-1ee9-4031-8767-af367ded3918	{"action":"logout","actor_id":"3f59c423-e6b5-499d-b5a3-67391b76fe48","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-01-06 13:44:56.807748+00	
00000000-0000-0000-0000-000000000000	fc5a07d0-d3c5-4877-8ff6-e36014e7343a	{"action":"login","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 13:45:05.993979+00	
00000000-0000-0000-0000-000000000000	d108b24c-2a9e-4a63-9450-245f8570ca76	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"3f59c423-e6b5-499d-b5a3-67391b76fe48","user_phone":""}}	2026-01-06 13:45:19.96465+00	
00000000-0000-0000-0000-000000000000	06c394d7-1508-4bfa-86ee-1992b83b70ca	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"356b0ed1-97cd-4c19-8fdf-d63c1bcf7dc7"}}	2026-01-06 13:46:06.142367+00	
00000000-0000-0000-0000-000000000000	7c1bdefb-ed67-4df3-99ab-d2406ee4723b	{"action":"user_signedup","actor_id":"356b0ed1-97cd-4c19-8fdf-d63c1bcf7dc7","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-06 13:47:49.733257+00	
00000000-0000-0000-0000-000000000000	74c9e93d-e0aa-453b-987c-03a56d97c175	{"action":"user_updated_password","actor_id":"356b0ed1-97cd-4c19-8fdf-d63c1bcf7dc7","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 13:47:57.403977+00	
00000000-0000-0000-0000-000000000000	c4dc9443-ccd1-4f23-89f8-030d84ad0906	{"action":"user_modified","actor_id":"356b0ed1-97cd-4c19-8fdf-d63c1bcf7dc7","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 13:47:57.406694+00	
00000000-0000-0000-0000-000000000000	5c4a2d26-0b88-4d21-b0c4-56b2ade44b75	{"action":"logout","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account"}	2026-01-06 13:59:19.129058+00	
00000000-0000-0000-0000-000000000000	f2d09d1a-f905-441c-be10-a72f7c86c438	{"action":"login","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 13:59:25.781413+00	
00000000-0000-0000-0000-000000000000	e8b9a2a8-452e-44b6-a8f4-cdc2d939ecec	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"356b0ed1-97cd-4c19-8fdf-d63c1bcf7dc7","user_phone":""}}	2026-01-06 14:01:45.988713+00	
00000000-0000-0000-0000-000000000000	02a6e144-8e35-408a-9a41-e1ba8437566b	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"ec112f37-ce86-4cb7-bd2f-5149cc755702"}}	2026-01-06 14:02:26.164148+00	
00000000-0000-0000-0000-000000000000	30eb7e27-198f-4937-a339-d1adce0ee4a4	{"action":"user_signedup","actor_id":"ec112f37-ce86-4cb7-bd2f-5149cc755702","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-06 14:02:49.552268+00	
00000000-0000-0000-0000-000000000000	3255d367-bf09-41f4-aa04-c88f924ed7a0	{"action":"user_updated_password","actor_id":"ec112f37-ce86-4cb7-bd2f-5149cc755702","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 14:02:56.681969+00	
00000000-0000-0000-0000-000000000000	f6329c66-10fe-4805-9210-9bed2fac08ed	{"action":"user_modified","actor_id":"ec112f37-ce86-4cb7-bd2f-5149cc755702","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 14:02:56.682711+00	
00000000-0000-0000-0000-000000000000	7e6360d1-e84c-48d5-a022-ec9615e531a1	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"ec112f37-ce86-4cb7-bd2f-5149cc755702","user_phone":""}}	2026-01-06 14:07:11.283135+00	
00000000-0000-0000-0000-000000000000	f5e6976f-0912-4de5-8f44-f62f3f63814c	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"49276da7-15d4-4d7a-a4f5-b6e9e82991a7"}}	2026-01-06 14:08:09.091647+00	
00000000-0000-0000-0000-000000000000	a20dab26-0615-4056-bc56-4b6d6dd3a455	{"action":"user_signedup","actor_id":"49276da7-15d4-4d7a-a4f5-b6e9e82991a7","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-06 14:08:27.798969+00	
00000000-0000-0000-0000-000000000000	23013a47-a08c-49ab-b28e-f803fd128199	{"action":"user_updated_password","actor_id":"49276da7-15d4-4d7a-a4f5-b6e9e82991a7","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 14:08:39.71522+00	
00000000-0000-0000-0000-000000000000	e8cd20e8-ff95-4230-bc70-8cb82fc54d98	{"action":"user_modified","actor_id":"49276da7-15d4-4d7a-a4f5-b6e9e82991a7","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 14:08:39.716234+00	
00000000-0000-0000-0000-000000000000	d71d4d52-98fe-4b97-8bd0-0882c747db01	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"49276da7-15d4-4d7a-a4f5-b6e9e82991a7","user_phone":""}}	2026-01-06 14:17:10.793014+00	
00000000-0000-0000-0000-000000000000	f02e81bd-88c0-4d1b-8e01-ca54cd6b7895	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"be684d04-7180-414a-857c-077a2f9d475a"}}	2026-01-06 14:19:28.721149+00	
00000000-0000-0000-0000-000000000000	ae423915-64e3-4603-92d6-620be5cb9ef8	{"action":"user_signedup","actor_id":"be684d04-7180-414a-857c-077a2f9d475a","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-06 14:19:56.495382+00	
00000000-0000-0000-0000-000000000000	a73dca64-b83f-4c62-8eeb-ffca04e5070e	{"action":"user_updated_password","actor_id":"be684d04-7180-414a-857c-077a2f9d475a","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 14:20:04.789878+00	
00000000-0000-0000-0000-000000000000	52b1baf5-10c1-48bf-8968-67203e8c24bb	{"action":"user_modified","actor_id":"be684d04-7180-414a-857c-077a2f9d475a","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 14:20:04.791278+00	
00000000-0000-0000-0000-000000000000	71893a96-49ad-4185-b6ba-96a377e7e84f	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"be684d04-7180-414a-857c-077a2f9d475a","user_phone":""}}	2026-01-06 14:27:25.532886+00	
00000000-0000-0000-0000-000000000000	4b5c9959-863c-4fec-935f-5d8c4fa270b9	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"5d13f68c-dc56-4685-b6ba-11aeb49bf09e"}}	2026-01-06 14:27:45.341761+00	
00000000-0000-0000-0000-000000000000	ec6d3d46-d8c9-4dee-b3ca-6879579018a3	{"action":"user_signedup","actor_id":"5d13f68c-dc56-4685-b6ba-11aeb49bf09e","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-06 14:28:02.546393+00	
00000000-0000-0000-0000-000000000000	0166935e-d331-40e6-bd19-42c7dc0d5946	{"action":"user_updated_password","actor_id":"5d13f68c-dc56-4685-b6ba-11aeb49bf09e","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 14:28:10.093999+00	
00000000-0000-0000-0000-000000000000	fd174528-9e60-439c-b539-d07ff0b9e4ca	{"action":"user_modified","actor_id":"5d13f68c-dc56-4685-b6ba-11aeb49bf09e","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 14:28:10.096083+00	
00000000-0000-0000-0000-000000000000	844bf793-a09b-4316-8925-862b7797eb55	{"action":"token_refreshed","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-01-06 14:57:31.941206+00	
00000000-0000-0000-0000-000000000000	44b5335b-a101-41e8-9a5a-993ec1a721c2	{"action":"token_revoked","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-01-06 14:57:31.968885+00	
00000000-0000-0000-0000-000000000000	487f1249-dd8b-4d07-b30d-c1abfcd82936	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"5d13f68c-dc56-4685-b6ba-11aeb49bf09e","user_phone":""}}	2026-01-06 15:01:08.562061+00	
00000000-0000-0000-0000-000000000000	5bc444cc-991f-4aeb-aa94-b3aafd76b509	{"action":"logout","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-01-06 15:01:33.751056+00	
00000000-0000-0000-0000-000000000000	efb3afa1-4d46-44de-a91e-f05723382d5d	{"action":"login","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 15:01:41.164828+00	
00000000-0000-0000-0000-000000000000	d97d8231-7357-4506-83b2-2c24ab84a533	{"action":"logout","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account"}	2026-01-06 15:02:06.549991+00	
00000000-0000-0000-0000-000000000000	73d6084a-754b-4ac5-8043-9d0f4616ac03	{"action":"login","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-06 15:02:22.348987+00	
00000000-0000-0000-0000-000000000000	9be1ff4e-888f-4e63-a005-bb8b85206bac	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"l227870@lhr.nu.edu.pk","user_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b"}}	2026-01-06 15:02:47.993332+00	
00000000-0000-0000-0000-000000000000	2f677688-0790-4c76-81b8-20b5f4688b78	{"action":"user_signedup","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-06 15:03:12.809125+00	
00000000-0000-0000-0000-000000000000	04417065-f2d7-43f8-a314-6013104842c1	{"action":"user_updated_password","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 15:03:20.20071+00	
00000000-0000-0000-0000-000000000000	db8e919a-518d-44ce-98ae-d9bf72e8553d	{"action":"user_modified","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"user"}	2026-01-06 15:03:20.205087+00	
00000000-0000-0000-0000-000000000000	9db4e5c2-4f8f-4f27-998e-ab04a4c8cc55	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-07 07:13:29.436615+00	
00000000-0000-0000-0000-000000000000	8ad2bc87-ea41-4737-b600-3f27cfdcaa1a	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-07 07:13:29.463283+00	
00000000-0000-0000-0000-000000000000	98bc2a50-eecb-4353-8eeb-802d01dc9bbd	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-07 07:16:07.527081+00	
00000000-0000-0000-0000-000000000000	aabbe2a2-7c2b-4b7f-bcb9-5e818bfd30db	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-07 08:04:33.747419+00	
00000000-0000-0000-0000-000000000000	62aefed6-4e83-4753-8a1b-25368dee4d5b	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-07 09:02:53.115411+00	
00000000-0000-0000-0000-000000000000	fe6e3bc8-dc02-425d-b592-3927529a6d59	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-07 09:02:53.131847+00	
00000000-0000-0000-0000-000000000000	508208de-febb-4f42-90e9-d5c54d83d915	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-07 10:01:08.25976+00	
00000000-0000-0000-0000-000000000000	98885408-5d5b-45f0-8f04-5e7fb5635c84	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-07 10:01:08.288367+00	
00000000-0000-0000-0000-000000000000	76d6e637-a89a-482a-abc2-7bd63a8569c7	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-07 10:59:31.238204+00	
00000000-0000-0000-0000-000000000000	c78c05e2-7597-4b14-81e3-4d7e380449f8	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-07 10:59:31.255753+00	
00000000-0000-0000-0000-000000000000	0be77b9a-9a92-46f0-82d6-580934779696	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-07 11:57:52.808175+00	
00000000-0000-0000-0000-000000000000	0ec15c72-331f-4650-85e1-175b92eb9736	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-07 12:56:22.287184+00	
00000000-0000-0000-0000-000000000000	c7c9f910-ea6d-4132-9df3-b3d59a0002ab	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-07 12:56:22.303819+00	
00000000-0000-0000-0000-000000000000	88adc778-63f9-4bd0-8627-d41cf27fc211	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-08 07:27:05.211891+00	
00000000-0000-0000-0000-000000000000	08667849-2fd7-48fe-854f-6ce565b66997	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 09:07:55.83899+00	
00000000-0000-0000-0000-000000000000	cd2756ad-d5ef-43ba-92ea-601f8e09051e	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 09:07:55.865132+00	
00000000-0000-0000-0000-000000000000	6e611197-9531-4eb3-9009-3e2c748ea5bc	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-08 09:07:59.879101+00	
00000000-0000-0000-0000-000000000000	6c471566-daf7-484a-b990-7d3c0bbfeee9	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 10:20:51.876744+00	
00000000-0000-0000-0000-000000000000	20f7fe3a-1beb-4f97-8c62-1177b9d42ce2	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 10:20:51.890362+00	
00000000-0000-0000-0000-000000000000	708312d1-9813-4aef-8875-cf65f2607ef9	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-08 11:02:11.094684+00	
00000000-0000-0000-0000-000000000000	b915970a-8218-45a7-88e2-0e824646dba2	{"action":"login","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-08 11:03:00.270818+00	
00000000-0000-0000-0000-000000000000	428318b6-17a2-4861-b6bd-68a2c285e3b2	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 11:30:01.695883+00	
00000000-0000-0000-0000-000000000000	cbdf2bb9-e927-422d-9c69-9a1f625ef111	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 11:30:01.715765+00	
00000000-0000-0000-0000-000000000000	a57d5dc8-7934-4b8d-b9ed-7551c062b84c	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 12:28:06.234678+00	
00000000-0000-0000-0000-000000000000	6d4bee7e-9903-4ca9-ad17-c806ab233984	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 12:28:06.252841+00	
00000000-0000-0000-0000-000000000000	9259f90c-f1a7-4caa-a8f1-6ba35b72e610	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 13:20:04.261929+00	
00000000-0000-0000-0000-000000000000	d510fa12-b4ef-4147-a23b-a6f28ffb01d2	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 13:20:04.277482+00	
00000000-0000-0000-0000-000000000000	4e9d338e-9f63-4b32-b988-c98d6e0fedfd	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 13:20:04.491259+00	
00000000-0000-0000-0000-000000000000	cd7ab6b6-bef6-486c-a07e-42e700aa0ff8	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 13:26:21.244698+00	
00000000-0000-0000-0000-000000000000	9ff236b7-8be5-4214-9b65-f2674ffe2f55	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 13:26:21.257587+00	
00000000-0000-0000-0000-000000000000	170e86e4-3ab9-41f9-bdef-3e5c4262710f	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 14:18:32.03782+00	
00000000-0000-0000-0000-000000000000	b710617f-109a-47c3-9adb-8fca5ebe88b8	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 14:18:32.06034+00	
00000000-0000-0000-0000-000000000000	f3224a11-2e2f-4b2e-9293-43aa61f1d41f	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-08 14:23:45.190211+00	
00000000-0000-0000-0000-000000000000	c7d245ab-21a0-41ac-9034-219d2ea70cd4	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 17:06:25.635649+00	
00000000-0000-0000-0000-000000000000	f31a073a-81b3-4d64-8501-e0d2db822552	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 17:06:25.666168+00	
00000000-0000-0000-0000-000000000000	b58b3f8c-105c-4aa0-8ccb-594484f3d5cc	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-08 17:35:03.658434+00	
00000000-0000-0000-0000-000000000000	2048fc24-217a-4242-ad37-e1b3386e6309	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-08 17:36:05.269825+00	
00000000-0000-0000-0000-000000000000	27e8c9bd-2f6c-40b4-bbaf-0363e5372327	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-08 17:38:41.152031+00	
00000000-0000-0000-0000-000000000000	189cc407-2c11-4590-8924-4ab66546e166	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-08 17:41:52.912542+00	
00000000-0000-0000-0000-000000000000	edbb6f97-9ec1-44eb-9da7-413b9b5d4590	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 17:43:26.952476+00	
00000000-0000-0000-0000-000000000000	37678bb7-822f-4e12-a2d8-97252f18dde5	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 17:43:26.968007+00	
00000000-0000-0000-0000-000000000000	764d9204-9bdb-4b48-af71-7d06a012b4b2	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 17:43:27.011688+00	
00000000-0000-0000-0000-000000000000	532c7a66-fff2-4cc5-9e5a-e653278e603e	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-08 17:44:56.0866+00	
00000000-0000-0000-0000-000000000000	a1b3ee14-3b8d-4ca8-93b4-ecb3cbd16633	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 19:04:13.94597+00	
00000000-0000-0000-0000-000000000000	d5c7bb41-1c19-4b57-9d07-7f8f050b9a04	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 19:04:13.965298+00	
00000000-0000-0000-0000-000000000000	6975d6a1-7aa9-40a4-a9ca-e16c6eb1e433	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 21:01:58.322123+00	
00000000-0000-0000-0000-000000000000	32ab0f3c-c57a-42df-b310-7f9169f6df6e	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-08 21:01:58.341368+00	
00000000-0000-0000-0000-000000000000	134d6264-8888-4375-a31c-882266ec3a5b	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-09 03:53:37.506698+00	
00000000-0000-0000-0000-000000000000	e4ee9ee5-c9b3-46c3-b978-7968c295dd66	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-09 03:53:37.523572+00	
00000000-0000-0000-0000-000000000000	8e3ae511-a751-4fbf-b62a-176fdef2f0f1	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-09 03:54:39.960756+00	
00000000-0000-0000-0000-000000000000	941ed85a-9159-4d68-9929-83ad1e45011a	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-01-09 03:55:31.30636+00	
00000000-0000-0000-0000-000000000000	4cb25cca-c046-40f2-a943-1346ba3b13fd	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-09 07:54:45.153094+00	
00000000-0000-0000-0000-000000000000	814f856a-9ff9-45ab-9750-bf55f84eb061	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-09 09:24:53.43926+00	
00000000-0000-0000-0000-000000000000	19f165ad-a63b-4514-8ba3-2e17b2174df6	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-09 09:24:53.462419+00	
00000000-0000-0000-0000-000000000000	c7fc9a41-99dc-450d-9b94-a7abdbf0dbe7	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-09 10:23:31.136855+00	
00000000-0000-0000-0000-000000000000	5e93d870-6639-425c-93e8-a908186631fe	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-09 10:23:31.153893+00	
00000000-0000-0000-0000-000000000000	11d4b106-574e-4c97-a5f8-84ff897659ed	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-09 10:40:24.828823+00	
00000000-0000-0000-0000-000000000000	d72d21f1-5590-4557-9564-9dcd7ca32289	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-09 11:21:59.614304+00	
00000000-0000-0000-0000-000000000000	a0e094c9-2615-4ef1-a384-af0ec2ba884c	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-09 11:21:59.634777+00	
00000000-0000-0000-0000-000000000000	3f0c54e4-ec50-4e41-9644-f5b1613d2f23	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-09 12:26:08.753345+00	
00000000-0000-0000-0000-000000000000	78d55167-ccf1-47d3-8da0-2d5cefc186ad	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-09 12:26:08.782142+00	
00000000-0000-0000-0000-000000000000	ea5ed5c7-2500-4161-87f8-b8bae25de7a8	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-10 02:30:39.899508+00	
00000000-0000-0000-0000-000000000000	f794d6de-7807-48d1-b7c3-5e25304213cf	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-10 03:36:15.409873+00	
00000000-0000-0000-0000-000000000000	6078b7d8-38a3-44df-94fb-da896fc3b44e	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-10 03:36:15.436135+00	
00000000-0000-0000-0000-000000000000	69037ea1-1475-4cff-9088-2826104e5d39	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-10 07:24:48.408424+00	
00000000-0000-0000-0000-000000000000	45dec350-174a-4dd0-9610-e4353d576739	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-10 07:24:48.438249+00	
00000000-0000-0000-0000-000000000000	d928e88a-eef2-4c37-81a9-f1e0ec2ced2c	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-10 08:20:14.792376+00	
00000000-0000-0000-0000-000000000000	9b68560b-4914-401f-835b-35bcda86acac	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-10 14:44:41.182418+00	
00000000-0000-0000-0000-000000000000	c0c8dc56-72fc-4b20-bac7-fa473192a8fb	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-10 14:44:41.204822+00	
00000000-0000-0000-0000-000000000000	2a27e36a-d5f9-4b96-bd77-29c637795dc0	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-10 17:24:14.849259+00	
00000000-0000-0000-0000-000000000000	6d37cc13-d4b9-4389-9587-414ced7d365b	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-10 17:24:14.872491+00	
00000000-0000-0000-0000-000000000000	24ca12ee-72f5-471c-80f9-f39b9aa1ad0f	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-12 15:57:11.707901+00	
00000000-0000-0000-0000-000000000000	26218142-616b-4bab-a897-50d68a462405	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-12 15:57:11.731372+00	
00000000-0000-0000-0000-000000000000	bae6d1bf-179c-4c20-ae64-54a457968922	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-12 23:29:02.828318+00	
00000000-0000-0000-0000-000000000000	072c119f-518c-4507-b5c8-593c8bf1274d	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-13 02:59:00.446855+00	
00000000-0000-0000-0000-000000000000	c3ec0b75-6aca-4f7a-8b50-ab04a138b7c6	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-13 02:59:00.477667+00	
00000000-0000-0000-0000-000000000000	a78c7ee8-5d89-4e0f-a7ec-c8e7b32c165b	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-13 07:56:50.043402+00	
00000000-0000-0000-0000-000000000000	e33e0891-5816-4476-9693-dc3b10e8c428	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-13 07:56:50.062715+00	
00000000-0000-0000-0000-000000000000	9241018f-08a5-46d8-9b78-bb6b13c7cf78	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-14 01:29:08.945028+00	
00000000-0000-0000-0000-000000000000	b4c5c388-4064-4efd-bf67-9f7892175f5c	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-01-14 01:35:58.067896+00	
00000000-0000-0000-0000-000000000000	6f3b3961-faf3-4568-bd79-8f0f73da6898	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-14 01:38:23.765081+00	
00000000-0000-0000-0000-000000000000	6c3392be-067c-4357-8104-8fc435052560	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-01-14 01:41:41.430833+00	
00000000-0000-0000-0000-000000000000	5bf0b312-1714-413e-92c6-42b3cda0f5b0	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-14 11:13:18.545656+00	
00000000-0000-0000-0000-000000000000	b987e2fb-0427-4df5-82ad-153294748678	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-15 09:36:04.961184+00	
00000000-0000-0000-0000-000000000000	a3f0bb45-bfcc-49e2-a683-7edd49b096ad	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-15 12:02:02.124777+00	
00000000-0000-0000-0000-000000000000	8cf5f002-a8be-4423-8208-97250b109831	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-15 12:02:02.150378+00	
00000000-0000-0000-0000-000000000000	0c08ea5b-a6d5-49fb-ba0f-fd235f9eef15	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-15 13:00:06.482448+00	
00000000-0000-0000-0000-000000000000	5ce18a80-d347-40ef-809b-be0914ad873a	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-15 13:00:06.502512+00	
00000000-0000-0000-0000-000000000000	d33f20f6-5f39-496b-acc3-9cb388755de7	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-15 14:00:11.888554+00	
00000000-0000-0000-0000-000000000000	b484fb03-3996-41a5-8abd-20a7c4737461	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-15 14:00:11.899837+00	
00000000-0000-0000-0000-000000000000	5ad09550-8669-4f21-b9e5-f3b04562aa81	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-01-15 14:00:13.244677+00	
00000000-0000-0000-0000-000000000000	9091e64f-c652-45eb-b83a-e182691cf974	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-15 14:18:56.87583+00	
00000000-0000-0000-0000-000000000000	d2adc04e-70b8-4419-8b11-6c55f8525f3e	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-15 15:02:22.602961+00	
00000000-0000-0000-0000-000000000000	7037fe4b-04ac-4a2a-8fb4-3e0010660b0b	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-15 21:56:10.663356+00	
00000000-0000-0000-0000-000000000000	d2e6e974-e250-4d31-9030-f7a4a684c0b2	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-16 05:05:15.753525+00	
00000000-0000-0000-0000-000000000000	0e01a321-faff-43ec-a0ab-7a28d03b87a8	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-16 05:05:15.777481+00	
00000000-0000-0000-0000-000000000000	65520e77-4c0e-477b-a907-14e1cb6fbfa6	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-16 05:05:24.420486+00	
00000000-0000-0000-0000-000000000000	2afbcda4-f9bf-4884-9029-e6ced10cd1ac	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-16 06:30:56.165621+00	
00000000-0000-0000-0000-000000000000	8f0d7db0-db84-44d2-9dd5-0873e7ed178d	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-16 06:30:56.189242+00	
00000000-0000-0000-0000-000000000000	654ca86a-221a-440d-a4da-c8c10a6cf453	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-16 07:53:52.323365+00	
00000000-0000-0000-0000-000000000000	abb5bd13-4634-407a-b662-f462aaa4e535	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-16 07:53:52.338393+00	
00000000-0000-0000-0000-000000000000	9a36bb80-8880-4489-9429-73759a401de3	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-16 07:54:06.435537+00	
00000000-0000-0000-0000-000000000000	d1ec4657-d9c0-4254-8292-fd065a3d8924	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-16 07:56:50.921557+00	
00000000-0000-0000-0000-000000000000	8cab958e-3669-4817-b933-2e8b07c00eba	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-01-16 08:36:03.081305+00	
00000000-0000-0000-0000-000000000000	d37fd3d0-2c5f-4be0-9391-ebfc5a5a34ed	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-16 08:36:06.459221+00	
00000000-0000-0000-0000-000000000000	9ad3d953-2112-458a-935a-9fa2b3b7462e	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-01-16 08:40:58.148285+00	
00000000-0000-0000-0000-000000000000	91318bf8-06ee-494a-823e-be5d20d0120f	{"action":"login","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-16 08:41:02.897228+00	
00000000-0000-0000-0000-000000000000	fff8b8d2-9632-4629-a332-c99c97a0ea9b	{"action":"token_refreshed","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-01-16 15:25:39.507469+00	
00000000-0000-0000-0000-000000000000	53b5249d-5061-4ef0-9e2a-bf9d51612d10	{"action":"token_revoked","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-01-16 15:25:39.531258+00	
00000000-0000-0000-0000-000000000000	2e46213d-ff94-4776-843f-5ca7e8b70ee5	{"action":"token_refreshed","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-01-16 16:24:06.506887+00	
00000000-0000-0000-0000-000000000000	02117d1e-eacb-4229-a50d-a4e3716d0864	{"action":"token_revoked","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-01-16 16:24:06.529962+00	
00000000-0000-0000-0000-000000000000	2eed33f4-a869-4f59-8d8f-2f2e73ca7730	{"action":"token_refreshed","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-01-16 17:22:37.19334+00	
00000000-0000-0000-0000-000000000000	202e56db-f42a-4778-972c-72ebe35108cc	{"action":"token_revoked","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-01-16 17:22:37.214817+00	
00000000-0000-0000-0000-000000000000	52fe278f-09c6-483b-bb3f-229b55322981	{"action":"token_refreshed","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-01-16 18:36:04.012647+00	
00000000-0000-0000-0000-000000000000	8cdd7652-82fd-4245-a20f-26ccc5810f59	{"action":"token_revoked","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-01-16 18:36:04.042731+00	
00000000-0000-0000-0000-000000000000	1d0904b8-82f8-4606-b5ab-83da1b45c560	{"action":"logout","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-01-16 18:42:05.624695+00	
00000000-0000-0000-0000-000000000000	d59f785a-d79f-4963-a3e0-aed30ec7e2a7	{"action":"login","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-16 18:42:10.443303+00	
00000000-0000-0000-0000-000000000000	50546ee0-5a47-445d-8f58-d330fa804a5b	{"action":"token_refreshed","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-16 19:40:22.818123+00	
00000000-0000-0000-0000-000000000000	a5c15c58-1e14-47d8-8218-8187c60e97be	{"action":"token_revoked","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-16 19:40:22.838231+00	
00000000-0000-0000-0000-000000000000	2acab9c9-2787-4de8-adbd-29b588bebde6	{"action":"token_refreshed","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-16 20:38:24.866132+00	
00000000-0000-0000-0000-000000000000	e07f6dc4-3d30-4096-a519-64756c91f040	{"action":"token_revoked","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-16 20:38:24.887764+00	
00000000-0000-0000-0000-000000000000	d1c78e3c-0445-40dd-bb79-926b35875972	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-16 20:43:59.076117+00	
00000000-0000-0000-0000-000000000000	493793a1-78a6-4455-86e7-582008c36bd6	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-16 21:13:40.386539+00	
00000000-0000-0000-0000-000000000000	ec5ca37b-55ce-4a9e-aaac-81d319602e1e	{"action":"token_refreshed","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-16 21:39:21.665791+00	
00000000-0000-0000-0000-000000000000	296828d4-cc8c-47c1-8a82-5460f8858f32	{"action":"token_revoked","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-16 21:39:21.685912+00	
00000000-0000-0000-0000-000000000000	baaaa664-9727-4f53-ac3b-bf16b676cea8	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-16 21:40:55.12958+00	
00000000-0000-0000-0000-000000000000	e454b4e6-5bed-468c-bdd9-e8fb7e31c8c7	{"action":"token_refreshed","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-17 13:37:30.252946+00	
00000000-0000-0000-0000-000000000000	d6829186-919b-431c-b782-ba9a9e4a73c3	{"action":"token_revoked","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-17 13:37:30.278866+00	
00000000-0000-0000-0000-000000000000	6c7973fc-b44d-496f-97e2-b954a3d08726	{"action":"token_refreshed","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-17 15:00:51.564974+00	
00000000-0000-0000-0000-000000000000	838fcba6-007b-4e0b-a93b-f8ccd15779fa	{"action":"token_revoked","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-17 15:00:51.581675+00	
00000000-0000-0000-0000-000000000000	7788f28f-2266-4255-9d61-664f63ac04cd	{"action":"token_refreshed","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-17 15:59:42.01746+00	
00000000-0000-0000-0000-000000000000	476b405c-6515-419b-8264-77c70d3deb2d	{"action":"token_revoked","actor_id":"ec497a26-965a-465d-a87d-f4a64c0106bc","actor_username":"admin@loanplatform.com","actor_via_sso":false,"log_type":"token"}	2026-01-17 15:59:42.026511+00	
00000000-0000-0000-0000-000000000000	d0ab7f61-e512-4e26-8148-e8691de0b23d	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-17 16:41:49.207091+00	
00000000-0000-0000-0000-000000000000	ab76b370-cde7-4bbf-b600-4862917814de	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-17 17:40:22.177788+00	
00000000-0000-0000-0000-000000000000	48f04f62-c734-4360-86b6-6332fbf9b4d3	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-17 17:40:22.192179+00	
00000000-0000-0000-0000-000000000000	15b0bc71-38b7-4a60-963e-1b15b8353b94	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-17 18:32:38.42493+00	
00000000-0000-0000-0000-000000000000	2d8b0cdc-5b75-4345-bc51-a65ae8a6a1be	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-17 18:50:33.471624+00	
00000000-0000-0000-0000-000000000000	2f66dc83-4fef-43ab-bd08-77f8d00f8724	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-17 18:50:33.486609+00	
00000000-0000-0000-0000-000000000000	f4bd0889-edc8-44b3-b566-4cfb365826b3	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-17 18:50:42.851582+00	
00000000-0000-0000-0000-000000000000	3d84c593-1884-4bde-9812-195fc40d4632	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-17 18:52:32.576081+00	
00000000-0000-0000-0000-000000000000	71d6653d-3ef0-4cdb-85a2-f2d2117e589e	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-17 18:55:46.38633+00	
00000000-0000-0000-0000-000000000000	1a500887-a111-431a-9441-bde278e38b5b	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-17 19:08:09.562924+00	
00000000-0000-0000-0000-000000000000	4e440924-729b-4afb-bbe6-c0fd7929e452	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-18 12:02:24.462613+00	
00000000-0000-0000-0000-000000000000	bf24ab0a-95e8-4fc1-993c-babe3d709d59	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-18 12:06:56.520446+00	
00000000-0000-0000-0000-000000000000	e5bd3f19-a4e0-475e-8923-0d91c12eed35	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-18 19:45:27.167729+00	
00000000-0000-0000-0000-000000000000	56946ecf-14cb-40bb-aad8-ec0b3cca9d0d	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-18 20:20:57.851645+00	
00000000-0000-0000-0000-000000000000	f1564fac-ae45-41e8-9b2b-e11f2fc29dd3	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-18 20:20:57.872204+00	
00000000-0000-0000-0000-000000000000	1f586948-d75a-43b9-85fc-81a4a249f3e5	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-18 20:21:01.414995+00	
00000000-0000-0000-0000-000000000000	c1807d11-d759-48e0-89d5-d692b3be48cd	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-01-18 20:21:23.164249+00	
00000000-0000-0000-0000-000000000000	03cd8064-116d-421f-9909-7305c79b1ad3	{"action":"login","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-18 20:21:28.436908+00	
00000000-0000-0000-0000-000000000000	5b3d3d98-5dac-4487-a5f3-1304c81ee8be	{"action":"logout","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-01-18 20:29:57.890229+00	
00000000-0000-0000-0000-000000000000	3fa2cc41-10bf-4167-b140-1f417d76fdb1	{"action":"login","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-18 20:30:04.463824+00	
00000000-0000-0000-0000-000000000000	02e68f97-d603-41f8-a0a9-8c68b52314e8	{"action":"logout","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-01-18 20:34:52.089042+00	
00000000-0000-0000-0000-000000000000	e237a4c8-b02b-456a-b353-69335399285e	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-18 20:34:55.356913+00	
00000000-0000-0000-0000-000000000000	e5d85cea-7d5d-4fee-b75b-2b85f8bab8b4	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-18 21:33:48.06698+00	
00000000-0000-0000-0000-000000000000	f472c436-8597-4b9d-941b-834cd970fe8f	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-18 21:33:48.079789+00	
00000000-0000-0000-0000-000000000000	6c0a3950-544c-4856-ab2d-f312ff672d4c	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-18 22:16:34.138207+00	
00000000-0000-0000-0000-000000000000	ba1e27be-d720-43f7-a577-bb3d9889c22a	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-01-18 22:16:59.407301+00	
00000000-0000-0000-0000-000000000000	dcd6ea4f-994d-402b-84d1-d13f928e6c88	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-19 18:24:36.389864+00	
00000000-0000-0000-0000-000000000000	885eade3-e9ea-42be-8552-22a1cc4ffb14	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-19 19:01:31.046502+00	
00000000-0000-0000-0000-000000000000	d45c2796-e06d-4962-a328-89ae86208af6	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-19 19:05:24.612348+00	
00000000-0000-0000-0000-000000000000	972acfda-87dd-4d62-922d-9996abb3e816	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-19 19:41:10.037998+00	
00000000-0000-0000-0000-000000000000	d0fa6095-b308-402e-aa4a-cde5d90c1b18	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-19 19:41:10.053716+00	
00000000-0000-0000-0000-000000000000	80780bf6-37cd-49e4-94bd-db95e2194d0b	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-19 20:03:46.961616+00	
00000000-0000-0000-0000-000000000000	62d48c3e-c141-44e6-99f2-bcc81701c4cb	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-19 20:41:45.685571+00	
00000000-0000-0000-0000-000000000000	6800f79c-b2e3-4ea1-977f-e4070a5e9090	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-19 20:41:45.700828+00	
00000000-0000-0000-0000-000000000000	65b3a153-3e6d-4cf7-a1ac-9409364693d6	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-19 21:25:53.048337+00	
00000000-0000-0000-0000-000000000000	df443c97-7e72-477c-a1d0-3dd16625b6c7	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-19 21:25:53.071246+00	
00000000-0000-0000-0000-000000000000	11050d27-2705-4e48-b6fc-40cc793177e1	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-21 17:19:45.117432+00	
00000000-0000-0000-0000-000000000000	6dd0376a-f1eb-41b8-856d-69f227f92920	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-21 17:19:45.146317+00	
00000000-0000-0000-0000-000000000000	3865fe62-b5dd-49a1-95a3-ba75d9e18dbc	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-21 17:21:22.900827+00	
00000000-0000-0000-0000-000000000000	6875bf27-39ea-47f1-b295-25b41906980e	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-21 17:47:10.678914+00	
00000000-0000-0000-0000-000000000000	20a121d9-d51d-4084-af80-1b5e44bc4d32	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-21 17:49:55.771281+00	
00000000-0000-0000-0000-000000000000	dc41521a-318a-4c4f-9362-99c4606ac17e	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-21 18:20:55.497919+00	
00000000-0000-0000-0000-000000000000	20edd150-39b3-4f93-907a-350aed301115	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-21 18:20:55.525921+00	
00000000-0000-0000-0000-000000000000	c6477f97-9f6f-48ab-a635-0fad02c88441	{"action":"login","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-21 18:47:56.010826+00	
00000000-0000-0000-0000-000000000000	d79da90a-a820-4320-90ff-2b86b7490002	{"action":"logout","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-01-21 18:54:45.466701+00	
00000000-0000-0000-0000-000000000000	a1ae6082-3953-40b7-90aa-39751f4642bc	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-01-21 18:57:56.059512+00	
00000000-0000-0000-0000-000000000000	9c6c1990-19fa-45ec-9e5f-6a4010b6c52c	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-21 19:08:39.874763+00	
00000000-0000-0000-0000-000000000000	234e5853-46b6-49bb-aefb-ff4a1ce12c71	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-01-21 19:13:33.291915+00	
00000000-0000-0000-0000-000000000000	9103dec2-9f55-48c3-b7d8-a87a39db8f77	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-21 19:22:18.750023+00	
00000000-0000-0000-0000-000000000000	b2de3c18-af3d-4abe-9316-eba1497e62a4	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-21 20:20:19.510427+00	
00000000-0000-0000-0000-000000000000	e326d69e-8629-4b81-913c-48aa2834f071	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-21 20:20:19.5305+00	
00000000-0000-0000-0000-000000000000	a61c4850-feef-4383-b4a1-7b2e8dc5c4d7	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-22 02:37:43.502764+00	
00000000-0000-0000-0000-000000000000	89b49ad5-3c28-4cbe-aaac-dd78310ecf2b	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-22 02:37:43.521226+00	
00000000-0000-0000-0000-000000000000	10742a3f-29eb-42c9-8e57-4b94e5ee6966	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-22 03:49:41.16402+00	
00000000-0000-0000-0000-000000000000	dc9547a0-4118-4040-94c5-fb8fd28b0246	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-22 03:49:41.177544+00	
00000000-0000-0000-0000-000000000000	6db718ab-e421-4246-8c63-5fdd81dc4e64	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-22 04:02:40.640354+00	
00000000-0000-0000-0000-000000000000	fffe5cbd-1cd0-4002-9304-419b06904be3	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-22 04:03:14.340756+00	
00000000-0000-0000-0000-000000000000	2a96b6b8-057c-42cd-a21c-732dab9fdd48	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-22 04:13:45.994664+00	
00000000-0000-0000-0000-000000000000	08a1a4cb-4701-4c63-bb82-d9b4f4687de1	{"action":"login","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-22 04:26:17.720433+00	
00000000-0000-0000-0000-000000000000	0d011fe5-8408-486e-88ef-6d957ee4d790	{"action":"logout","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-01-22 04:30:24.798572+00	
00000000-0000-0000-0000-000000000000	d13eebdb-1114-43e5-963d-d7d80af7a93f	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-22 04:35:51.536333+00	
00000000-0000-0000-0000-000000000000	9e07818f-0d98-4033-b032-f600c8efefdb	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-01-22 04:37:43.024139+00	
00000000-0000-0000-0000-000000000000	37a98a19-65e3-4768-8591-a9b16a37a808	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-22 04:37:45.573135+00	
00000000-0000-0000-0000-000000000000	7436d0b2-26f9-4b61-bd18-8e2c112ab3e6	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-22 21:04:07.16987+00	
00000000-0000-0000-0000-000000000000	7154c913-5ae5-420e-b7da-4ad582f34177	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-22 22:22:13.728973+00	
00000000-0000-0000-0000-000000000000	a01b4142-bcf2-401c-9530-72212aa211c0	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-23 00:04:39.913992+00	
00000000-0000-0000-0000-000000000000	97abbcae-89f9-4886-84c6-c7c4ac16b757	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-23 00:04:39.934558+00	
00000000-0000-0000-0000-000000000000	a31c08ea-848e-439f-95ec-8235f3a4b7eb	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-23 00:04:47.102411+00	
00000000-0000-0000-0000-000000000000	de72176c-35b4-4554-8855-478d4292ee44	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-23 00:52:51.050628+00	
00000000-0000-0000-0000-000000000000	e395562b-a46a-41b9-8c11-d8a0a831e28a	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-28 20:21:19.787136+00	
00000000-0000-0000-0000-000000000000	e42f98fd-96c4-41dc-89dd-cb5efb3cf565	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-23 18:04:21.733419+00	
00000000-0000-0000-0000-000000000000	57b14284-cb88-4aa2-9ac7-a8cafdf1800b	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-23 18:21:26.273281+00	
00000000-0000-0000-0000-000000000000	24d46177-31e5-4eec-b28d-d4b85df897a7	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-23 18:22:31.964973+00	
00000000-0000-0000-0000-000000000000	4d695509-49a1-40b5-a455-2d24b0edfdc3	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-23 18:22:31.967699+00	
00000000-0000-0000-0000-000000000000	7de99e69-f3e0-4ef9-b415-42bcdbf6bc49	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-23 19:05:29.060964+00	
00000000-0000-0000-0000-000000000000	679383e1-5c7a-4be1-ba2e-3a4b250bf52f	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-23 19:05:29.073963+00	
00000000-0000-0000-0000-000000000000	318185c3-435c-4698-887c-d2fdeffb5222	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-23 19:17:50.650067+00	
00000000-0000-0000-0000-000000000000	4f9169f1-6c0e-4cc2-b230-e3e693da7462	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-23 19:17:50.664982+00	
00000000-0000-0000-0000-000000000000	98a42b3f-5fee-4e40-ad70-d1fe4e0a9ade	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-23 19:19:29.680299+00	
00000000-0000-0000-0000-000000000000	52c1429f-95a1-42d1-8be0-23046ac9e74b	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-23 19:19:29.682981+00	
00000000-0000-0000-0000-000000000000	2967d683-7476-4489-b438-f5f77ecfdb3b	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-23 19:27:56.558677+00	
00000000-0000-0000-0000-000000000000	b15328d2-e6af-4a2f-8f06-52ad2df4bd2b	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-23 19:27:56.566787+00	
00000000-0000-0000-0000-000000000000	9e27f668-cf85-4009-ace0-4b918b65e21d	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-23 19:28:34.829552+00	
00000000-0000-0000-0000-000000000000	82a96953-d04d-4641-9d55-d2249f401725	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-23 20:04:24.134254+00	
00000000-0000-0000-0000-000000000000	d5274bcc-f680-4fdb-8f49-646a2b51c7e2	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-01-23 20:17:31.951723+00	
00000000-0000-0000-0000-000000000000	906654ec-03f7-477e-bbb8-1d80fb79592d	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-23 20:17:36.970273+00	
00000000-0000-0000-0000-000000000000	b01bfe59-3d9e-49d8-a98f-6244a08e71b4	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-23 20:39:13.055602+00	
00000000-0000-0000-0000-000000000000	5ffcc2df-3296-4f3a-a2b4-cd541735eb39	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-23 21:42:20.198808+00	
00000000-0000-0000-0000-000000000000	b02b06a2-6a93-421f-832c-04aa710a3016	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-23 23:00:21.984533+00	
00000000-0000-0000-0000-000000000000	2c221ff8-f2fc-47cf-ab84-e290e4eaf00e	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-23 23:00:22.012436+00	
00000000-0000-0000-0000-000000000000	a7b5bf2e-8594-40cd-b15c-81bc05eea5c9	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-23 23:02:22.224721+00	
00000000-0000-0000-0000-000000000000	540ab964-fd08-482f-a7d1-b262e3b17f54	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-24 13:17:42.481264+00	
00000000-0000-0000-0000-000000000000	9504cdcb-91d3-4bb1-b690-938f4f5ddd5d	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-24 13:17:42.504733+00	
00000000-0000-0000-0000-000000000000	a83bad02-c737-464d-a7af-14985c0fe484	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-28 06:07:17.836224+00	
00000000-0000-0000-0000-000000000000	7f7fada4-11b2-4ebf-8d16-b2a678638364	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-28 07:05:40.429888+00	
00000000-0000-0000-0000-000000000000	2c11bdac-c635-4507-b8ae-c43a9bd09043	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-28 07:05:40.456119+00	
00000000-0000-0000-0000-000000000000	14516c76-75a5-4388-9eb1-2da970c8694f	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-28 08:04:10.417087+00	
00000000-0000-0000-0000-000000000000	41912855-96eb-450b-b078-ab088cce1ba8	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-28 08:04:10.435149+00	
00000000-0000-0000-0000-000000000000	d61126e0-421c-478f-977e-5688a3e8f3cd	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-28 10:53:17.972016+00	
00000000-0000-0000-0000-000000000000	bb41f52b-6f3a-4118-bb01-6aba322b9992	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-28 10:53:17.988118+00	
00000000-0000-0000-0000-000000000000	310375e4-46af-4093-bac2-627cc139aa96	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-28 20:19:10.053887+00	
00000000-0000-0000-0000-000000000000	13cf1f8b-1a2f-4a81-8df1-28ef1f6bdad1	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-28 20:21:19.772894+00	
00000000-0000-0000-0000-000000000000	3246aa2f-00a1-4604-a47e-7373e5988ad9	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-28 20:21:29.846301+00	
00000000-0000-0000-0000-000000000000	26b169e3-b827-4022-90cd-f824df5f6401	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-28 21:26:18.283641+00	
00000000-0000-0000-0000-000000000000	7e3ebcd6-1fd7-45bd-a25c-2ef1e8c85b5a	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-28 21:26:18.306463+00	
00000000-0000-0000-0000-000000000000	a525f599-10f7-4643-b31b-c00695467ae7	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-28 21:46:50.949707+00	
00000000-0000-0000-0000-000000000000	d35ccafb-9d3a-41ee-81f2-e3f92e8447dc	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-30 13:57:58.061102+00	
00000000-0000-0000-0000-000000000000	1dd5e7dd-2155-49ff-8ed2-aaeb857473b6	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-30 13:57:58.085667+00	
00000000-0000-0000-0000-000000000000	2f6756df-be70-4b79-878b-687695b19898	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-30 13:57:59.943371+00	
00000000-0000-0000-0000-000000000000	a4f05eed-4a1e-4aea-9493-2c30bbcac46a	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-30 18:57:36.232646+00	
00000000-0000-0000-0000-000000000000	def7790e-76ce-40c3-b40b-1d0346c4f466	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-30 18:57:36.252266+00	
00000000-0000-0000-0000-000000000000	18e23f05-1766-4aa2-a2dc-4e2aea254961	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-30 19:20:04.62117+00	
00000000-0000-0000-0000-000000000000	fe19ba43-f53e-4f0c-b8f6-d6a498413b0d	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-30 19:20:04.638688+00	
00000000-0000-0000-0000-000000000000	10e85e55-6e2c-4bac-b79a-9814299c6876	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-30 19:20:20.940374+00	
00000000-0000-0000-0000-000000000000	0492fec7-6036-4862-adb8-d539833e2188	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-30 20:02:08.559293+00	
00000000-0000-0000-0000-000000000000	e2a50c9a-0582-4889-84da-1096453c49db	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-30 20:31:11.304679+00	
00000000-0000-0000-0000-000000000000	8a0f2054-6a77-4067-8334-ca7e2a70913e	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-31 05:16:33.691128+00	
00000000-0000-0000-0000-000000000000	e77632a4-287c-4405-88f1-dc2861a725e2	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-31 09:54:25.410425+00	
00000000-0000-0000-0000-000000000000	b80cb3f4-0591-481a-b753-c59f8de1213d	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-01-31 09:54:25.429554+00	
00000000-0000-0000-0000-000000000000	3f829c8f-8d60-4481-aa88-9c25920d82fe	{"action":"login","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-01 11:07:58.948798+00	
00000000-0000-0000-0000-000000000000	b270344d-d528-4f0a-b417-02ccff20c9d5	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-01 11:10:19.980899+00	
00000000-0000-0000-0000-000000000000	77542559-6b0c-4ef6-bda2-1039730e6d55	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-01 11:10:19.985248+00	
00000000-0000-0000-0000-000000000000	ec75a530-6741-4cf5-a198-870255e7c806	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-02-01 11:10:47.906092+00	
00000000-0000-0000-0000-000000000000	5c87a2bc-156c-44c1-b46c-6d2b2d32d8cd	{"action":"logout","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-01 11:11:27.467025+00	
00000000-0000-0000-0000-000000000000	5e9207c6-3f99-4a41-b425-006a1e07f5f4	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-01 11:11:33.568637+00	
00000000-0000-0000-0000-000000000000	888b8f92-2eff-4186-ae8f-6b5c80498880	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-01 12:35:47.915194+00	
00000000-0000-0000-0000-000000000000	2c37d853-5e0e-4c1a-912a-790a8ab0ac1a	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-01 12:35:47.940754+00	
00000000-0000-0000-0000-000000000000	f102c150-3e6c-43a0-a447-c6198966aca7	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-01 13:34:17.3986+00	
00000000-0000-0000-0000-000000000000	d5177f11-e625-4f97-89b6-00e0b9f3acaf	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-01 13:34:17.412037+00	
00000000-0000-0000-0000-000000000000	db817427-9666-40fe-ae5f-f4b5b777d08b	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-01 19:29:03.812225+00	
00000000-0000-0000-0000-000000000000	f155eefd-b648-47b3-abce-f63c2f0867ca	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-02-01 19:32:19.876314+00	
00000000-0000-0000-0000-000000000000	18fd449a-2a19-490d-a1dc-ee4a7600e38e	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-01 19:32:56.721245+00	
00000000-0000-0000-0000-000000000000	c5dfd84f-ffc7-49c1-9b8d-e4812b2798fa	{"action":"logout","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-01 19:36:40.787494+00	
00000000-0000-0000-0000-000000000000	a23bf51c-c002-4c4c-a324-b25518e38252	{"action":"login","actor_id":"11181907-e372-48c9-8f40-26a675d37a57","actor_username":"effectedars29@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-01 19:37:47.283368+00	
00000000-0000-0000-0000-000000000000	a2bcce43-ff8a-47be-b3c2-7bb997f649dc	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-02 13:31:36.293724+00	
00000000-0000-0000-0000-000000000000	d30c6213-7e2a-42b8-90f0-a61e0365dcc4	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-02 14:40:45.353968+00	
00000000-0000-0000-0000-000000000000	16a3aba5-5bd3-4a1f-a48a-f8eb93fd981a	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-02 14:40:45.38059+00	
00000000-0000-0000-0000-000000000000	370bb040-0d36-4c4a-b0f2-f614b5f997dd	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-02 15:36:56.501057+00	
00000000-0000-0000-0000-000000000000	0a1b4f67-ccf1-43fa-8a87-662d651bf9d6	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-02 16:51:25.035969+00	
00000000-0000-0000-0000-000000000000	a820bda5-1a3b-46c4-aa93-20ea9d6104ad	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-02 16:51:25.062837+00	
00000000-0000-0000-0000-000000000000	7180826f-1c82-47df-ba69-d308fef96288	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-02 16:56:30.903131+00	
00000000-0000-0000-0000-000000000000	14904be6-8558-457e-a81b-087460da59ea	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-02 20:31:15.224285+00	
00000000-0000-0000-0000-000000000000	fbdab76a-a08f-403d-a7a7-9d5241476624	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 05:12:58.760669+00	
00000000-0000-0000-0000-000000000000	bcc235e4-fce1-4798-ab48-0b32f23ca2fa	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 05:12:58.78877+00	
00000000-0000-0000-0000-000000000000	b9fbf8b0-1b75-4490-91cc-613c7e0b9e32	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 06:21:29.180245+00	
00000000-0000-0000-0000-000000000000	aeb6531d-29b2-4548-9e15-e63dbf5a89a5	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 06:21:29.203954+00	
00000000-0000-0000-0000-000000000000	cc349474-f845-4273-9206-9b1ed4080051	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 06:36:02.632991+00	
00000000-0000-0000-0000-000000000000	88fc3803-0eda-4426-ae16-14dc79b182be	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 06:51:31.006322+00	
00000000-0000-0000-0000-000000000000	eadd220e-2031-4dfe-8132-10f828b0cd7b	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 08:02:40.296822+00	
00000000-0000-0000-0000-000000000000	0c6d3510-3e1d-444a-851f-6ab8a29343ef	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 08:02:40.321264+00	
00000000-0000-0000-0000-000000000000	b6f9d35d-c160-4c12-9f16-f74f887083ce	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 08:11:12.276832+00	
00000000-0000-0000-0000-000000000000	8ee4dc07-6cf9-44d8-8c8e-971bf62a13ed	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 08:12:27.556624+00	
00000000-0000-0000-0000-000000000000	e64d9b07-f732-423a-b49d-cbc9473e6428	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 08:22:57.700658+00	
00000000-0000-0000-0000-000000000000	bb86435f-9ee8-40cf-923e-933be87df7b7	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 08:34:57.281483+00	
00000000-0000-0000-0000-000000000000	d3dda870-2da7-4504-a566-aa91beed0e08	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 08:38:00.855481+00	
00000000-0000-0000-0000-000000000000	feb1be8b-e53a-48e5-8cfb-3e7c8a8a036b	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 08:47:51.442429+00	
00000000-0000-0000-0000-000000000000	9a3c66e9-a655-4025-9d3f-4b032289edb2	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 08:48:42.486888+00	
00000000-0000-0000-0000-000000000000	7f2718b1-f618-4458-9b5a-780c167c4bf9	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 09:23:06.605857+00	
00000000-0000-0000-0000-000000000000	83a0c447-3500-43e2-9aa6-072bd0476ba7	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 09:23:06.629881+00	
00000000-0000-0000-0000-000000000000	267ebfb9-2f54-4ecc-834d-4f60952e8316	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-02-03 09:38:07.396979+00	
00000000-0000-0000-0000-000000000000	30cde783-6b72-4ce7-82da-8084a20ba838	{"action":"login","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 09:47:52.668889+00	
00000000-0000-0000-0000-000000000000	6a97a11c-c367-4820-9ad6-ca25d22e645d	{"action":"user_invited","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hussnainali50674@gmail.com","user_id":"38b56d65-fe46-4865-aa7c-ae8ba8c72bbf"}}	2026-02-03 09:50:12.710278+00	
00000000-0000-0000-0000-000000000000	91004d57-4b56-49ce-9f52-d2b4ddec7d81	{"action":"user_signedup","actor_id":"38b56d65-fe46-4865-aa7c-ae8ba8c72bbf","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-02-03 09:51:15.053891+00	
00000000-0000-0000-0000-000000000000	f4d5571f-6efa-4d74-ad66-e759488350c1	{"action":"user_updated_password","actor_id":"38b56d65-fe46-4865-aa7c-ae8ba8c72bbf","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"user"}	2026-02-03 09:51:31.615587+00	
00000000-0000-0000-0000-000000000000	676bb811-7b14-45ac-a1cd-6773c011d594	{"action":"user_modified","actor_id":"38b56d65-fe46-4865-aa7c-ae8ba8c72bbf","actor_username":"hussnainali50674@gmail.com","actor_via_sso":false,"log_type":"user"}	2026-02-03 09:51:31.617572+00	
00000000-0000-0000-0000-000000000000	1dabf23b-014a-4a97-847c-6c2bd1d71d6a	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 09:59:15.888687+00	
00000000-0000-0000-0000-000000000000	452193f6-cbc8-4c55-8aed-0a8ac91d2611	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 10:00:03.822981+00	
00000000-0000-0000-0000-000000000000	175e3e7a-bb3d-4c36-bc87-8b7db718bf08	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-02-03 10:01:29.29676+00	
00000000-0000-0000-0000-000000000000	25e3ebd8-4cf5-4a0d-a814-ed57cc7e26f2	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 10:01:56.233898+00	
00000000-0000-0000-0000-000000000000	330dca8d-cc6a-4911-aeaf-c4eaa45ff12f	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 10:27:27.116861+00	
00000000-0000-0000-0000-000000000000	516558f5-56a7-4315-9f8b-ebdeeab9babb	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 10:28:07.569693+00	
00000000-0000-0000-0000-000000000000	2e4f657f-d31d-41d6-9a4b-9a945d55aaf5	{"action":"token_refreshed","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-03 11:03:16.554895+00	
00000000-0000-0000-0000-000000000000	e6d0f591-18e1-4ca5-b3af-22876a26fdfa	{"action":"token_revoked","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"token"}	2026-02-03 11:03:16.581025+00	
00000000-0000-0000-0000-000000000000	032f0029-ba10-433d-8aad-c7bbf3f2928e	{"action":"login","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 11:06:37.209551+00	
00000000-0000-0000-0000-000000000000	dfbc3ee1-2fd7-45c5-9b05-b05ce4912179	{"action":"logout","actor_id":"2305fed5-ed7c-42ee-99db-3223e3b2ea06","actor_username":"rabiuddin1@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-02-03 11:06:50.246348+00	
00000000-0000-0000-0000-000000000000	3be38ba1-874e-415f-adbd-ebe7e464d7d4	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 11:07:34.478322+00	
00000000-0000-0000-0000-000000000000	619ecfd9-3716-463d-96d3-1b22ff522f8a	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 11:08:59.609195+00	
00000000-0000-0000-0000-000000000000	a36d2396-478b-4b2b-8f2e-3089f2caec0e	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 11:10:02.856662+00	
00000000-0000-0000-0000-000000000000	e6b45515-a05d-4d87-8ab5-1d8b16adc835	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 11:11:40.517967+00	
00000000-0000-0000-0000-000000000000	c624d33b-05e6-42b9-a8ed-f182c75084b4	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 11:13:21.809112+00	
00000000-0000-0000-0000-000000000000	6f5fef77-9f08-4df4-9b8f-0963bb182d5a	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 11:13:23.409317+00	
00000000-0000-0000-0000-000000000000	41d6265c-e463-4024-beb3-df119bcc36a7	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 11:14:45.761956+00	
00000000-0000-0000-0000-000000000000	48e83b38-502f-48b6-9d73-4c47f6c2abc6	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 11:14:57.968586+00	
00000000-0000-0000-0000-000000000000	2f2ac3b8-d7e1-40bc-8f7a-8c7dde1d8232	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 11:16:16.693151+00	
00000000-0000-0000-0000-000000000000	b06030b8-482a-4085-b708-7f42e9deb324	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 11:48:48.230648+00	
00000000-0000-0000-0000-000000000000	d00273d2-6dc3-4c14-8c2f-2b87d7b9a74d	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 11:50:35.287478+00	
00000000-0000-0000-0000-000000000000	9da4f876-cfac-4ba3-9034-d71b9c7349be	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 11:51:16.673699+00	
00000000-0000-0000-0000-000000000000	1be61d0a-e1dc-4fe6-8bb0-fbb48f7ba358	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 12:04:49.521751+00	
00000000-0000-0000-0000-000000000000	142e2826-2422-4b5d-8f93-aad931a61ebb	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 12:08:57.767316+00	
00000000-0000-0000-0000-000000000000	3032f96c-7106-47be-b929-90eac223c0b8	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 12:10:43.667792+00	
00000000-0000-0000-0000-000000000000	43c0d102-58ba-42db-89b8-6a49fac985eb	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 12:20:45.321976+00	
00000000-0000-0000-0000-000000000000	767ef1ba-dc84-47ac-b7e3-90f79781e616	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 12:20:45.343598+00	
00000000-0000-0000-0000-000000000000	f63dc7ea-8008-4ed4-9823-4ce0456594fa	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 12:20:56.216245+00	
00000000-0000-0000-0000-000000000000	0fcecf81-d0a1-4f4c-87b9-d5901b38e2f1	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 12:54:47.757962+00	
00000000-0000-0000-0000-000000000000	9b8a6515-d340-4505-8431-311715d428fd	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 12:54:47.778256+00	
00000000-0000-0000-0000-000000000000	61c1cee3-37e7-4804-8914-a1ac0b7fe050	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 13:15:39.130611+00	
00000000-0000-0000-0000-000000000000	1fd58f0b-83d4-4e0c-8381-15fff92a44ec	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 13:19:51.946784+00	
00000000-0000-0000-0000-000000000000	cbf9c63e-fa2b-4974-9022-0380c9923f83	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 13:28:55.284557+00	
00000000-0000-0000-0000-000000000000	32771f0d-01cf-4dbf-831e-7dd68cf0a536	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 13:31:50.493466+00	
00000000-0000-0000-0000-000000000000	975f4ded-ae6b-431b-a1cb-8b60a0f103bb	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 13:43:45.865387+00	
00000000-0000-0000-0000-000000000000	65a57ae3-985b-4836-98b6-fa1e26bfdb87	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 13:46:22.999608+00	
00000000-0000-0000-0000-000000000000	693e7283-fdbd-4782-a877-714b7922f927	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 14:00:13.343351+00	
00000000-0000-0000-0000-000000000000	aee1aeb1-93b1-4683-ad85-ecac8762411d	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 14:05:15.71305+00	
00000000-0000-0000-0000-000000000000	b71cf955-d76a-4114-91aa-3dcc34565534	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 14:07:19.840453+00	
00000000-0000-0000-0000-000000000000	8cdfae57-fe37-45f5-8e93-bf5be0a61220	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 14:07:19.848906+00	
00000000-0000-0000-0000-000000000000	a2e141ee-e3fa-4c56-b871-8fc6c222c533	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 14:11:37.172054+00	
00000000-0000-0000-0000-000000000000	59c1c53e-a86d-4d48-940d-d2112ed33244	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 14:44:30.712873+00	
00000000-0000-0000-0000-000000000000	7a693ef8-a396-460f-974c-6e191aabf5a6	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 14:44:30.73504+00	
00000000-0000-0000-0000-000000000000	e856bfc4-6e70-4ac5-8636-1e0c7fe7c052	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 14:46:29.316813+00	
00000000-0000-0000-0000-000000000000	5eae2c30-293b-4650-b6a8-6d60a894d2e9	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 14:51:46.229296+00	
00000000-0000-0000-0000-000000000000	bcd82e5b-b449-4b4e-970d-da29574f5689	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 15:10:19.917297+00	
00000000-0000-0000-0000-000000000000	c8015894-05ac-4d93-ba86-15a95e93aaf7	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 15:17:03.881176+00	
00000000-0000-0000-0000-000000000000	f41e5f83-dbdc-47a8-8bbb-90d8b376427d	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-03 15:19:11.427144+00	
00000000-0000-0000-0000-000000000000	97d7c7b9-cce3-4db0-9acd-41051c99e315	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 16:17:29.496987+00	
00000000-0000-0000-0000-000000000000	fb5f343c-909e-4dcf-a422-5b1945915769	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 16:17:29.520749+00	
00000000-0000-0000-0000-000000000000	388f2af6-2821-4a4d-9c35-125de75da7ab	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 17:16:01.829217+00	
00000000-0000-0000-0000-000000000000	440d50c3-5c37-44a9-8c22-3dff7dfe8f00	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 17:16:01.841477+00	
00000000-0000-0000-0000-000000000000	afa18183-9dc6-479a-bbe4-223cd62769c7	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 18:14:29.553991+00	
00000000-0000-0000-0000-000000000000	2ecb2380-715b-48fa-b102-4d1f836a9ef6	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 18:14:29.566467+00	
00000000-0000-0000-0000-000000000000	ded0fe95-6102-4bbe-bb0b-71132c6008b1	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 19:12:59.301215+00	
00000000-0000-0000-0000-000000000000	5488c62d-7c51-431e-b503-b59b378783b8	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-03 19:12:59.315903+00	
00000000-0000-0000-0000-000000000000	6e6aa41c-760f-4fc3-b804-9d6782d09602	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-04 02:17:11.045872+00	
00000000-0000-0000-0000-000000000000	78786436-6798-46e4-93a4-453d674090e2	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 03:58:14.949529+00	
00000000-0000-0000-0000-000000000000	3d776911-ff3a-4b90-8aa9-46b84df898b9	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 03:58:14.977796+00	
00000000-0000-0000-0000-000000000000	19f4e4ad-2eef-404d-bacc-c33bc8a661b9	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 06:04:49.219637+00	
00000000-0000-0000-0000-000000000000	8e30d01d-8162-4797-ac61-33e2d6ce2fe9	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 06:04:49.247784+00	
00000000-0000-0000-0000-000000000000	5d158396-063d-4d1b-8c28-b8b5297ecf27	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 10:10:42.585624+00	
00000000-0000-0000-0000-000000000000	1ff60d36-0ad2-4203-89f5-77ace5b4634d	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 10:10:42.603939+00	
00000000-0000-0000-0000-000000000000	164d06b5-d360-4095-8244-ffb8008d1c95	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 11:09:12.409564+00	
00000000-0000-0000-0000-000000000000	8fae874d-a714-4043-9871-f6e6d6906b49	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 11:09:12.433351+00	
00000000-0000-0000-0000-000000000000	a29241e8-dc8c-44d0-acba-2311e57cbc8c	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 11:59:40.819438+00	
00000000-0000-0000-0000-000000000000	e2dd2118-170b-4c46-a9d9-95a9fe557e71	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 11:59:40.838458+00	
00000000-0000-0000-0000-000000000000	42a87c15-a581-4de5-b5c4-08e93b74db12	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-04 12:00:07.780679+00	
00000000-0000-0000-0000-000000000000	909feb18-9118-4129-a196-ce3b566cfe69	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 12:07:44.768903+00	
00000000-0000-0000-0000-000000000000	3d5a360e-a67d-4764-b7dc-1c9c11b6881e	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 12:07:44.779939+00	
00000000-0000-0000-0000-000000000000	64de80b7-1315-46d6-8528-e36fda94a425	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 12:20:41.119279+00	
00000000-0000-0000-0000-000000000000	af619751-ac24-43ad-aeb3-0fbd2289e07c	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 12:20:41.127438+00	
00000000-0000-0000-0000-000000000000	1b70b3b9-9055-4f26-be7f-27b07dab2319	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-04 12:20:55.010301+00	
00000000-0000-0000-0000-000000000000	9442fd0b-dfd7-47bf-a465-7184b15da60e	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-04 12:28:26.767055+00	
00000000-0000-0000-0000-000000000000	d0359f51-90ce-4a38-a1b5-4c5ba0b0e9c5	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 13:06:12.244303+00	
00000000-0000-0000-0000-000000000000	28f2c7ee-4487-4b1d-9a10-f874c3d5c8ee	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 13:06:12.264001+00	
00000000-0000-0000-0000-000000000000	2e6caf5d-d624-48f8-8a1a-0f7b6714b62f	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 13:23:56.019653+00	
00000000-0000-0000-0000-000000000000	88e583df-12b4-4706-b864-c4bc1c0c0ee2	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 13:23:56.027338+00	
00000000-0000-0000-0000-000000000000	51fd4b20-b710-40a9-a764-7e07ee8f58ff	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 13:24:02.1558+00	
00000000-0000-0000-0000-000000000000	0990b4a0-c83e-4c4f-b12c-d3404bede984	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 13:24:02.157734+00	
00000000-0000-0000-0000-000000000000	704e1397-ff18-47cc-bd00-3f23e19165a2	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 13:26:38.333229+00	
00000000-0000-0000-0000-000000000000	db045c23-f243-4e56-9a74-7c9846e57086	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 13:26:38.335784+00	
00000000-0000-0000-0000-000000000000	0978fafc-9921-468b-ad28-f3fce4c2b24c	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 13:53:24.162639+00	
00000000-0000-0000-0000-000000000000	4a9a8fd8-5943-42ce-9fa3-3685dcf013a1	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 13:53:24.169918+00	
00000000-0000-0000-0000-000000000000	4ec4ece1-a456-43d0-beb4-b58a3494531b	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-04 13:55:44.69627+00	
00000000-0000-0000-0000-000000000000	dd545223-4a6f-4bb6-a87c-841dbeecea45	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-04 14:04:53.20056+00	
00000000-0000-0000-0000-000000000000	930ff1ed-1855-409f-818a-3c4f46d264a4	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-04 14:20:56.874886+00	
00000000-0000-0000-0000-000000000000	2e8cd115-6521-4e1b-ae48-7ff00e65a231	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-04 14:28:31.503079+00	
00000000-0000-0000-0000-000000000000	aa87a085-bc78-45f3-b594-d1fa0a6c2299	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 14:31:34.720888+00	
00000000-0000-0000-0000-000000000000	0ccd0005-bebd-44c2-b093-7e89321c87f7	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 14:31:34.725579+00	
00000000-0000-0000-0000-000000000000	8a970379-4f96-4c4f-b1f4-c1646f580d2f	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-04 14:32:21.367667+00	
00000000-0000-0000-0000-000000000000	0505cac8-60c7-4982-a740-7701bd78a0ec	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-04 14:33:19.054976+00	
00000000-0000-0000-0000-000000000000	840fde24-7bea-442c-b077-ca24b038c1f1	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-04 14:40:48.566227+00	
00000000-0000-0000-0000-000000000000	32043a5d-8f24-4aca-ad22-5a9fc6f3e953	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-04 14:46:04.350331+00	
00000000-0000-0000-0000-000000000000	e6a30b14-5638-4947-9d20-5317bae11d4e	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 15:03:22.284644+00	
00000000-0000-0000-0000-000000000000	900016df-50d7-4ebf-9eb9-58f588c344b9	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 15:03:22.311788+00	
00000000-0000-0000-0000-000000000000	7a0b24be-b3cc-4172-86d0-90edb3ed27c3	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-04 15:12:26.630085+00	
00000000-0000-0000-0000-000000000000	1e7ff89f-0541-442d-a609-0b49dd48fa92	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 16:01:37.662025+00	
00000000-0000-0000-0000-000000000000	6caf5bf5-50cb-41de-84fd-fa22e650961f	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 16:01:37.685574+00	
00000000-0000-0000-0000-000000000000	bbde27d2-c6c6-4d2d-ba6b-76dcab634be8	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 17:00:09.464747+00	
00000000-0000-0000-0000-000000000000	0ff76f31-f7f4-4caf-8b9e-52e2cf7e3fad	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 17:00:09.482484+00	
00000000-0000-0000-0000-000000000000	5f6dfa43-7e91-42fb-b83b-3c3375fcbb80	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 17:58:38.353312+00	
00000000-0000-0000-0000-000000000000	5fcda8d5-f219-4981-af33-ddc067d27ab4	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 17:58:38.362927+00	
00000000-0000-0000-0000-000000000000	6bed925a-bb16-441b-96c3-d76f0cb43443	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 18:57:07.825576+00	
00000000-0000-0000-0000-000000000000	79a091bd-af64-44e1-b355-5ea6b4951e3a	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 18:57:07.841944+00	
00000000-0000-0000-0000-000000000000	ca814686-421b-4e38-85e1-01f76b5db3c3	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 19:55:36.536921+00	
00000000-0000-0000-0000-000000000000	65358868-67d8-495d-a23b-4900b0b16f53	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 19:55:36.551754+00	
00000000-0000-0000-0000-000000000000	2cb42d6f-e5ef-4246-b9ba-0cc743821852	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 20:54:01.36595+00	
00000000-0000-0000-0000-000000000000	10e15868-6355-4d00-96a1-34bcec04846c	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-04 20:54:01.393271+00	
00000000-0000-0000-0000-000000000000	f94a9246-857c-4637-9a12-5bdc5956798f	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 08:06:52.721027+00	
00000000-0000-0000-0000-000000000000	bc66f8cc-a27d-4df6-ab09-76c09b954f76	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 08:06:52.750693+00	
00000000-0000-0000-0000-000000000000	270ba6c5-31d8-48a7-a542-930169bc3b67	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-05 12:01:15.703066+00	
00000000-0000-0000-0000-000000000000	f704cc73-f547-4974-8ed9-b5ee9ce05b45	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-05 12:19:26.067725+00	
00000000-0000-0000-0000-000000000000	78970abf-4fa6-4fa1-ad28-7b06b07692c0	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 12:38:36.72225+00	
00000000-0000-0000-0000-000000000000	214cd048-dabe-4356-8dd3-243985559c61	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 12:38:36.737733+00	
00000000-0000-0000-0000-000000000000	d62785dd-f083-4678-ac50-e29f220d699a	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-05 12:38:55.515112+00	
00000000-0000-0000-0000-000000000000	1c73056b-7e56-482d-a7d4-158bc90b77a0	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-05 12:53:37.168312+00	
00000000-0000-0000-0000-000000000000	eede547f-0537-4dc7-888b-0356316d0b0b	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-05 12:54:22.952653+00	
00000000-0000-0000-0000-000000000000	ba2afdfe-f453-4113-969c-faeacc1bd454	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-05 12:59:18.100891+00	
00000000-0000-0000-0000-000000000000	ac054c1f-0b2d-4216-9970-12e8698828bb	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-05 13:32:38.869028+00	
00000000-0000-0000-0000-000000000000	64d903cf-d195-4fbf-9624-eab8fd6b6292	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-05 13:33:43.369979+00	
00000000-0000-0000-0000-000000000000	c8f0dba2-7f98-4be1-81dd-c90963ba993b	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-05 13:36:11.811668+00	
00000000-0000-0000-0000-000000000000	d63d13d7-957a-444a-9df0-c7d267a4d2b9	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 14:34:28.345314+00	
00000000-0000-0000-0000-000000000000	ec820a71-918a-4e28-9267-e1c759a4f23e	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 14:34:28.365241+00	
00000000-0000-0000-0000-000000000000	ab2c4e5d-d9f6-4fa6-881f-71ece7e7e87e	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 14:41:24.043478+00	
00000000-0000-0000-0000-000000000000	9ba1b10e-5003-4c85-967f-3f8696490fab	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 14:41:24.056096+00	
00000000-0000-0000-0000-000000000000	3407699b-5611-41bd-a95c-edc01b14e62c	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-05 16:53:36.338621+00	
00000000-0000-0000-0000-000000000000	dfcb2e21-270a-4a32-a791-39ec96cf4ead	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-05 17:11:16.602572+00	
00000000-0000-0000-0000-000000000000	b81423cd-07f3-4974-99df-9fd7b6bc2f4e	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-05 17:14:33.001227+00	
00000000-0000-0000-0000-000000000000	dc0fcf85-755f-4178-9da4-1ecdf7283328	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 17:40:44.09804+00	
00000000-0000-0000-0000-000000000000	b697e1a0-6eed-4438-91d9-a0943619ffd0	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 17:40:44.112738+00	
00000000-0000-0000-0000-000000000000	205ef680-7766-4278-9bd1-745a08d4aab9	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 18:39:15.655352+00	
00000000-0000-0000-0000-000000000000	5376c304-5dc7-4d83-b8bf-74c1b15986c1	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 18:39:15.669121+00	
00000000-0000-0000-0000-000000000000	1b66c3a8-b3a0-4ec3-a78d-44cc0a5687be	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 19:14:27.471901+00	
00000000-0000-0000-0000-000000000000	807a6075-69ce-4412-9efd-b5c657849911	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 19:14:27.482385+00	
00000000-0000-0000-0000-000000000000	ec368a76-23c8-4dea-a0bd-749376dd165f	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-05 19:15:07.304835+00	
00000000-0000-0000-0000-000000000000	28ff9b15-75f9-402c-a5db-4aa73a86c6b6	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-05 19:33:02.109652+00	
00000000-0000-0000-0000-000000000000	f6e8cb8e-beee-44ae-b868-62c650a9eb01	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 19:37:32.070847+00	
00000000-0000-0000-0000-000000000000	225db2d1-55b2-4cb1-921b-50f32497820c	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-05 19:37:32.073737+00	
00000000-0000-0000-0000-000000000000	d953b379-6568-4707-a431-fbd3685faaa5	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-05 20:21:03.369909+00	
00000000-0000-0000-0000-000000000000	b161d7d4-2a04-4cb4-bdf5-12e93fea526d	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 07:48:46.523966+00	
00000000-0000-0000-0000-000000000000	aee3a302-b712-4eaa-a5fb-8e654440d5ff	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 07:48:46.552911+00	
00000000-0000-0000-0000-000000000000	89f686dd-4cbc-4f1a-bcde-8fda3e0cc68e	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 08:12:21.552465+00	
00000000-0000-0000-0000-000000000000	010f7366-6fd9-40cf-86f4-c6ec2fbcc5e2	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 08:12:21.564542+00	
00000000-0000-0000-0000-000000000000	7be79c65-4b85-4e38-979a-db69a96d0b26	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 09:10:35.452794+00	
00000000-0000-0000-0000-000000000000	fea1fa57-638c-4982-bd6c-cec81601a8f5	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 09:10:35.471329+00	
00000000-0000-0000-0000-000000000000	d8828623-0181-4b5c-9e6a-9f6f5836a1ca	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 10:08:52.445566+00	
00000000-0000-0000-0000-000000000000	9eacd581-e4ea-4184-9039-79d8b4659934	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 10:08:52.462964+00	
00000000-0000-0000-0000-000000000000	e31923ba-bdbc-4c40-b61d-b1a0e968d112	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 11:07:11.37958+00	
00000000-0000-0000-0000-000000000000	4575edc9-4314-4da2-97fa-a9c404b8ccd3	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 11:07:11.388469+00	
00000000-0000-0000-0000-000000000000	4b9c6d13-0083-4f45-8ae7-7264f3dadd5d	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 11:16:29.600767+00	
00000000-0000-0000-0000-000000000000	b6ab267a-e5f1-4e99-b880-7b80fbe532fe	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 11:16:29.610146+00	
00000000-0000-0000-0000-000000000000	13c08084-7c82-414a-a270-66257176b38f	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 11:20:31.450772+00	
00000000-0000-0000-0000-000000000000	aa9e2137-fc45-46be-bd9d-d68fdd91abd1	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 11:20:31.464318+00	
00000000-0000-0000-0000-000000000000	765a89f1-b94a-441a-b62f-0ca4dfb3a4a8	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 12:05:29.532679+00	
00000000-0000-0000-0000-000000000000	eec63ab2-fc90-4f92-839c-2aec08fe6028	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 12:05:29.548846+00	
00000000-0000-0000-0000-000000000000	7cf14a0d-025b-4260-8904-2cd2da1ca10e	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 12:15:00.781948+00	
00000000-0000-0000-0000-000000000000	e77a2168-1e60-45b1-a7ac-28434248b801	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 12:15:00.792654+00	
00000000-0000-0000-0000-000000000000	aa2f931f-567c-457e-84e8-875fe9b750af	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 12:43:37.704829+00	
00000000-0000-0000-0000-000000000000	128dec5c-e761-48c1-9d72-c053b1781880	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 12:43:37.718081+00	
00000000-0000-0000-0000-000000000000	4794ae7c-e1b5-4905-b204-1b716e3e477b	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 13:03:48.812048+00	
00000000-0000-0000-0000-000000000000	e8e891a8-0f97-4392-980c-cf8bd01cb50b	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 13:03:48.824536+00	
00000000-0000-0000-0000-000000000000	3e7099c3-3076-4b27-8eb1-4a9e10eff068	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 13:13:31.013468+00	
00000000-0000-0000-0000-000000000000	5647e286-ac79-42b8-89c0-f393a7237eab	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 13:13:31.046948+00	
00000000-0000-0000-0000-000000000000	6c111e32-7e21-4b5b-9bbf-91c744e524f9	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 14:02:07.244191+00	
00000000-0000-0000-0000-000000000000	e1f24c86-3842-4a68-ae61-cd7745bb8b98	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 14:02:07.261282+00	
00000000-0000-0000-0000-000000000000	d69fa5c8-ddfb-4199-b64a-d3a5eafe22e3	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 14:02:09.643434+00	
00000000-0000-0000-0000-000000000000	709d88eb-534e-48ed-ab27-97434dbcd50b	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 14:02:09.644517+00	
00000000-0000-0000-0000-000000000000	ba2dcde6-f774-47fb-ba56-7abf2b872575	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 14:12:00.48722+00	
00000000-0000-0000-0000-000000000000	27bf4b82-9c41-4dcb-a8c0-0c3b04c7ecea	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 14:12:00.493446+00	
00000000-0000-0000-0000-000000000000	28731ed7-dc15-4ec6-9253-a8d1411dc4e8	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 15:00:26.340811+00	
00000000-0000-0000-0000-000000000000	5845f302-0fe4-4e34-8ebb-3f6976507d24	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 15:00:26.363303+00	
00000000-0000-0000-0000-000000000000	36e0fc14-10c9-4944-898e-106c71db8724	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 15:10:30.926019+00	
00000000-0000-0000-0000-000000000000	01d8e6e0-8557-49d4-ab97-9b40fe1512d7	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 15:10:30.934536+00	
00000000-0000-0000-0000-000000000000	f8df853d-d622-4bdb-aa64-91997b0eda00	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 15:58:43.389655+00	
00000000-0000-0000-0000-000000000000	73e49fc1-ca49-4c63-8cd8-c8463eaba7fe	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 15:58:43.414705+00	
00000000-0000-0000-0000-000000000000	801c329a-2026-4db5-98f2-868958b1e77a	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 16:01:42.138506+00	
00000000-0000-0000-0000-000000000000	1863ba5b-184f-477a-9673-cf5648687743	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 16:01:42.149954+00	
00000000-0000-0000-0000-000000000000	239b7df0-af6d-42b3-861b-1cdd1cecefa0	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 16:03:54.28061+00	
00000000-0000-0000-0000-000000000000	1142ed12-4ff2-472d-9e19-8aac1c838687	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 16:03:54.283657+00	
00000000-0000-0000-0000-000000000000	89d6983e-6d4e-4cfb-828f-e540441e23b9	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 16:09:00.459917+00	
00000000-0000-0000-0000-000000000000	8a5e27ae-bd81-4ef7-91b8-83bd1bc4475d	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 16:09:00.462743+00	
00000000-0000-0000-0000-000000000000	bd70a26f-fc8d-4255-947b-766739affd70	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 16:57:02.11605+00	
00000000-0000-0000-0000-000000000000	ae0a4485-9e99-425b-a93a-ca11b4b0ff54	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 16:57:02.139328+00	
00000000-0000-0000-0000-000000000000	70f0e52d-78be-4128-8a50-8a87cf6de8ec	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 17:07:30.986992+00	
00000000-0000-0000-0000-000000000000	f8c87454-f47e-4893-9536-e7eb2b3dd9ab	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 17:07:30.998511+00	
00000000-0000-0000-0000-000000000000	6eddfd5f-a2eb-47de-944b-12712cb2f809	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 17:55:18.442541+00	
00000000-0000-0000-0000-000000000000	f24c996f-ae5e-4977-b055-d90ce41c1c82	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 17:55:18.462496+00	
00000000-0000-0000-0000-000000000000	9df9131c-3963-4722-9a52-b0a59d393150	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 18:06:00.614281+00	
00000000-0000-0000-0000-000000000000	35376458-99e9-475f-a012-046486ecbdef	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 18:06:00.628688+00	
00000000-0000-0000-0000-000000000000	aff1dc98-535c-44dc-87e9-11559298a919	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 18:53:36.329183+00	
00000000-0000-0000-0000-000000000000	3fdc2a6f-7de7-4ad3-bee0-fc4d9d3aaebd	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 18:53:36.344418+00	
00000000-0000-0000-0000-000000000000	3a3d480a-d93f-49f5-a0af-9414b93efb2d	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 19:04:30.61665+00	
00000000-0000-0000-0000-000000000000	7eb12e3b-2fdc-4e64-bab9-56c51802ca67	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 19:04:30.62838+00	
00000000-0000-0000-0000-000000000000	f75fc03e-5bf6-4599-a048-1e7417061a32	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 19:51:53.226806+00	
00000000-0000-0000-0000-000000000000	3efef592-e8e0-4f95-889a-42fe7608f21c	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 19:51:53.250454+00	
00000000-0000-0000-0000-000000000000	fb94cde0-8065-4ac8-bcab-fab10da6360e	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 20:03:00.356008+00	
00000000-0000-0000-0000-000000000000	f4ece9a6-e914-4447-8959-b2ae11efbb67	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 20:03:00.365358+00	
00000000-0000-0000-0000-000000000000	e1af6d40-86de-4454-ae2d-564f019e6f88	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 21:01:30.405342+00	
00000000-0000-0000-0000-000000000000	1e496335-17ce-4d6d-95b6-f715b1959e8f	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 21:01:30.417114+00	
00000000-0000-0000-0000-000000000000	e08ecbdc-e9f2-4ae5-b9c9-ead829eb640a	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 22:00:00.513453+00	
00000000-0000-0000-0000-000000000000	f6e90a3f-3d2b-4a6a-b626-68a406e02e2a	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 22:00:00.529446+00	
00000000-0000-0000-0000-000000000000	7dc4552a-537d-4cfa-a651-ad4bcf4239f2	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 23:44:53.315964+00	
00000000-0000-0000-0000-000000000000	3eae86e1-77f7-4744-a409-263f74b2d0e9	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-06 23:44:53.332613+00	
00000000-0000-0000-0000-000000000000	72d28e0d-5249-41bf-b2e0-fae3c9cb87c5	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 01:41:30.36269+00	
00000000-0000-0000-0000-000000000000	44b56ba3-270a-4752-b563-09fa627863d7	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 01:41:30.374173+00	
00000000-0000-0000-0000-000000000000	6921ce58-e948-4de5-aeea-49e2c2e94289	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 03:38:09.393616+00	
00000000-0000-0000-0000-000000000000	1eb56e5a-b2ba-4194-a92b-92e2d8b1ceda	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 03:38:09.409232+00	
00000000-0000-0000-0000-000000000000	4efdb89d-70d8-4a3f-98ba-90745eb78354	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 05:34:43.468834+00	
00000000-0000-0000-0000-000000000000	cda48446-9b1b-4c52-90f3-aa602ff08009	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 05:34:43.49169+00	
00000000-0000-0000-0000-000000000000	cdcedeaf-e640-4419-98dc-837f4d1033f6	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 07:31:21.387306+00	
00000000-0000-0000-0000-000000000000	89681011-bb4a-4645-8314-cb5cc9631d08	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 07:31:21.403454+00	
00000000-0000-0000-0000-000000000000	1ff0902e-8c16-4477-9a90-c0f92d520084	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 09:27:56.318734+00	
00000000-0000-0000-0000-000000000000	724674b0-02ea-44d0-8986-6ae6d037b568	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 09:27:56.333882+00	
00000000-0000-0000-0000-000000000000	a1b2fa5a-e261-43f9-9139-984b766c81f1	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 11:24:32.112077+00	
00000000-0000-0000-0000-000000000000	f52e9153-fde6-4b09-93da-2e6ce3442f68	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 11:24:32.129544+00	
00000000-0000-0000-0000-000000000000	4b39cde3-c89e-45ff-85f7-2f650c16ca94	{"action":"token_refreshed","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 12:42:22.796976+00	
00000000-0000-0000-0000-000000000000	312119d8-7cbb-4def-840c-698320c650cc	{"action":"token_revoked","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"token"}	2026-02-07 12:42:22.813925+00	
00000000-0000-0000-0000-000000000000	533caeda-1f73-4da7-87e8-778de865eb1c	{"action":"login","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-07 12:42:35.518676+00	
00000000-0000-0000-0000-000000000000	496cdd70-3510-41c8-ad38-4661e4ea592d	{"action":"logout","actor_id":"0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b","actor_username":"l227870@lhr.nu.edu.pk","actor_via_sso":false,"log_type":"account"}	2026-02-07 12:42:42.130643+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
37d9bcfa-8b59-4724-afc9-391afa8acb88	b53dd3b4-7957-4dad-a5dc-5df0fc8527a2	909309e4-2b40-44f8-86fc-a47a99ba4597	s256	s_UYXKrh2xLp774Xic4_wRgqVBNaMgOL0QBNRgYnD-w	email			2025-09-04 12:58:02.18485+00	2025-09-04 12:58:02.18485+00	email/signup	\N	\N	\N	\N	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	{"sub": "0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b", "email": "l227870@lhr.nu.edu.pk", "email_verified": true, "phone_verified": false}	email	2026-01-06 15:02:47.982799+00	2026-01-06 15:02:47.982854+00	2026-01-06 15:02:47.982854+00	9151bbb5-c918-41f7-ae36-823bcf34ab2e
38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	{"sub": "38b56d65-fe46-4865-aa7c-ae8ba8c72bbf", "email": "hussnainali50674@gmail.com", "email_verified": true, "phone_verified": false}	email	2026-02-03 09:50:12.700215+00	2026-02-03 09:50:12.700806+00	2026-02-03 09:50:12.700806+00	eab98841-221e-4f6c-9c86-dcf44f4304e0
f4813fd2-f4dc-4f63-8e83-b4aec463fbdc	f4813fd2-f4dc-4f63-8e83-b4aec463fbdc	{"sub": "f4813fd2-f4dc-4f63-8e83-b4aec463fbdc", "email": "l226704@lhr.nu.edu.pk", "email_verified": false, "phone_verified": false}	email	2026-01-06 11:40:37.696291+00	2026-01-06 11:40:37.696345+00	2026-01-06 11:40:37.696345+00	c3743278-7dd9-4f20-af86-ca38b6bfdd8f
ec497a26-965a-465d-a87d-f4a64c0106bc	ec497a26-965a-465d-a87d-f4a64c0106bc	{"sub": "ec497a26-965a-465d-a87d-f4a64c0106bc", "email": "admin@loanplatform.com", "email_verified": false, "phone_verified": false}	email	2025-10-23 13:03:17.518914+00	2025-10-23 13:03:17.519556+00	2025-10-23 13:03:17.519556+00	7640f77c-6f7d-48ae-8fdf-a30a6f8eebdc
b6a99233-868e-4743-9b8e-40223fb4f9e8	b6a99233-868e-4743-9b8e-40223fb4f9e8	{"sub": "b6a99233-868e-4743-9b8e-40223fb4f9e8", "email": "abdulrehman@sudostudy.com", "email_verified": true, "phone_verified": false}	email	2025-10-23 13:04:54.739769+00	2025-10-23 13:04:54.739823+00	2025-10-23 13:04:54.739823+00	b2364679-97d1-4ce8-96e5-c652db64b663
11181907-e372-48c9-8f40-26a675d37a57	11181907-e372-48c9-8f40-26a675d37a57	{"sub": "11181907-e372-48c9-8f40-26a675d37a57", "email": "effectedars29@gmail.com", "email_verified": true, "phone_verified": false}	email	2025-10-23 13:07:13.374449+00	2025-10-23 13:07:13.3745+00	2025-10-23 13:07:13.3745+00	eab89e1e-4538-4421-8697-b0ca4d12d458
2305fed5-ed7c-42ee-99db-3223e3b2ea06	2305fed5-ed7c-42ee-99db-3223e3b2ea06	{"sub": "2305fed5-ed7c-42ee-99db-3223e3b2ea06", "email": "rabiuddin1@gmail.com", "email_verified": true, "phone_verified": false}	email	2026-01-06 13:43:00.463723+00	2026-01-06 13:43:00.46377+00	2026-01-06 13:43:00.46377+00	dc702341-e904-4400-8882-450842406175
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
f0076ebe-27cc-4432-8f8d-612bb0ecd0e5	2026-02-07 20:46:39.406276+00	2026-02-07 20:46:39.406276+00	password	58e73e50-1ed7-4298-a6b6-25824aab307a
4b66b119-5356-48c3-86d8-1686a4817bdb	2026-01-16 18:42:10.479051+00	2026-01-16 18:42:10.479051+00	password	aef351e1-0dc0-450a-ad24-44a31e4ae07f
8f892e75-ce05-4081-91df-3058e7b7ecd2	2026-02-01 19:37:47.335231+00	2026-02-01 19:37:47.335231+00	password	073776da-6e3d-4374-a9a8-a4be9e7f9b31
89cb3263-96ba-4f49-bfae-a96694bb3478	2026-02-03 09:51:15.084407+00	2026-02-03 09:51:15.084407+00	otp	dddca3d3-2d10-45b2-9be1-16cd8d17bc50
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
b0893dcf-ff02-4054-ac73-1f05ad59134c	f4813fd2-f4dc-4f63-8e83-b4aec463fbdc	confirmation_token	2000bf04dab1e30efe4a8519e00b572e3b2a0099beb39cac02f1a503	l226704@lhr.nu.edu.pk	2026-01-06 11:40:39.441552	2026-01-06 11:40:39.441552
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	885	dsdppeyksb2u	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	f	2026-02-07 20:46:39.366043+00	2026-02-07 20:46:39.366043+00	\N	f0076ebe-27cc-4432-8f8d-612bb0ecd0e5
00000000-0000-0000-0000-000000000000	616	mvbaq67ngez4	ec497a26-965a-465d-a87d-f4a64c0106bc	t	2026-01-16 19:40:22.852695+00	2026-01-16 20:38:24.889813+00	q56nrlrqzhtl	4b66b119-5356-48c3-86d8-1686a4817bdb
00000000-0000-0000-0000-000000000000	620	fyas2ouq7adz	ec497a26-965a-465d-a87d-f4a64c0106bc	t	2026-01-16 21:39:21.70098+00	2026-01-17 13:37:30.28327+00	jzt2bazpslzi	4b66b119-5356-48c3-86d8-1686a4817bdb
00000000-0000-0000-0000-000000000000	622	3uwsdflpjgce	ec497a26-965a-465d-a87d-f4a64c0106bc	t	2026-01-17 13:37:30.312673+00	2026-01-17 15:00:51.584322+00	fyas2ouq7adz	4b66b119-5356-48c3-86d8-1686a4817bdb
00000000-0000-0000-0000-000000000000	624	luzignol4uh5	ec497a26-965a-465d-a87d-f4a64c0106bc	f	2026-01-17 15:59:42.036206+00	2026-01-17 15:59:42.036206+00	kvdlgdzsnvsp	4b66b119-5356-48c3-86d8-1686a4817bdb
00000000-0000-0000-0000-000000000000	615	q56nrlrqzhtl	ec497a26-965a-465d-a87d-f4a64c0106bc	t	2026-01-16 18:42:10.470826+00	2026-01-16 19:40:22.841277+00	\N	4b66b119-5356-48c3-86d8-1686a4817bdb
00000000-0000-0000-0000-000000000000	712	upsl6tsgbhxm	11181907-e372-48c9-8f40-26a675d37a57	f	2026-02-01 19:37:47.314412+00	2026-02-01 19:37:47.314412+00	\N	8f892e75-ce05-4081-91df-3058e7b7ecd2
00000000-0000-0000-0000-000000000000	617	jzt2bazpslzi	ec497a26-965a-465d-a87d-f4a64c0106bc	t	2026-01-16 20:38:24.916622+00	2026-01-16 21:39:21.688411+00	mvbaq67ngez4	4b66b119-5356-48c3-86d8-1686a4817bdb
00000000-0000-0000-0000-000000000000	623	kvdlgdzsnvsp	ec497a26-965a-465d-a87d-f4a64c0106bc	t	2026-01-17 15:00:51.595893+00	2026-01-17 15:59:42.028324+00	3uwsdflpjgce	4b66b119-5356-48c3-86d8-1686a4817bdb
00000000-0000-0000-0000-000000000000	733	sm7odb6nxblh	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	f	2026-02-03 09:51:15.069367+00	2026-02-03 09:51:15.069367+00	\N	89cb3263-96ba-4f49-bfae-a96694bb3478
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
f0076ebe-27cc-4432-8f8d-612bb0ecd0e5	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	2026-02-07 20:46:39.31805+00	2026-02-07 20:46:39.31805+00	\N	aal1	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	174.239.177.28	\N	\N	\N	\N	\N
89cb3263-96ba-4f49-bfae-a96694bb3478	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	2026-02-03 09:51:15.067487+00	2026-02-03 09:51:15.067487+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	39.39.163.4	\N	\N	\N	\N	\N
4b66b119-5356-48c3-86d8-1686a4817bdb	ec497a26-965a-465d-a87d-f4a64c0106bc	2026-01-16 18:42:10.461098+00	2026-01-17 15:59:42.0534+00	\N	aal1	\N	2026-01-17 15:59:42.053281	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	182.181.232.138	\N	\N	\N	\N	\N
8f892e75-ce05-4081-91df-3058e7b7ecd2	11181907-e372-48c9-8f40-26a675d37a57	2026-02-01 19:37:47.295981+00	2026-02-01 19:37:47.295981+00	\N	aal1	\N	\N	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	67.170.254.147	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	b6a99233-868e-4743-9b8e-40223fb4f9e8	authenticated	authenticated	abdulrehman@sudostudy.com	$2a$10$LuTMsOva4FKU/Izj1bnj4uv5LBTmUbI/AoacZFM/mlUMIByedNeH2	2025-10-23 13:05:36.117862+00	2025-10-23 13:04:54.742182+00		\N		\N			\N	2025-11-04 13:02:37.280751+00	{"provider": "email", "providers": ["email"]}	{"role": "company_admin", "company_id": "8397bc63-e24e-4897-ad56-4d48d6efd130", "company_name": "sudostudy", "email_verified": true}	\N	2025-10-23 13:04:54.735585+00	2025-11-04 13:02:37.329421+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	f4813fd2-f4dc-4f63-8e83-b4aec463fbdc	authenticated	authenticated	l226704@lhr.nu.edu.pk		\N	2026-01-06 11:40:37.702276+00	2000bf04dab1e30efe4a8519e00b572e3b2a0099beb39cac02f1a503	2026-01-06 11:40:37.702276+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"role": "employee", "last_name": "Sahab", "company_id": "f82dbe8d-2f42-4e64-a8b7-095e2f115b83", "first_name": "Hamid"}	\N	2026-01-06 11:40:37.682199+00	2026-01-06 11:40:39.439657+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	authenticated	authenticated	hussnainali50674@gmail.com	$2a$10$5gts/hCnTQ4o1sR3fjcsMu34SsMv.w0ARy1urBoSNChFHJNq6Yuvm	2026-02-03 09:51:15.055408+00	2026-02-03 09:50:12.717608+00		\N		\N			\N	2026-02-03 09:51:15.066769+00	{"provider": "email", "providers": ["email"]}	{"role": "employee", "last_name": "tiger", "company_id": "fb47ea33-5d83-4a8b-b670-b0ee993e36d0", "first_name": "husseeee", "email_verified": true}	\N	2026-02-03 09:50:12.660968+00	2026-02-03 09:51:31.613364+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	11181907-e372-48c9-8f40-26a675d37a57	authenticated	authenticated	effectedars29@gmail.com	$2a$10$2YI3kWoM1jl5huwvdyuTK.YImQbQmzPROVRof06d1J3azELxBB7RO	2025-10-23 13:16:16.33796+00	2025-10-23 13:07:13.377757+00		\N		\N			\N	2026-02-01 19:37:47.295192+00	{"provider": "email", "providers": ["email"]}	{"role": "employee", "last_name": "boy", "company_id": "8397bc63-e24e-4897-ad56-4d48d6efd130", "first_name": "star", "email_verified": true}	\N	2025-10-23 13:07:13.368719+00	2026-02-01 19:37:47.331728+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ec497a26-965a-465d-a87d-f4a64c0106bc	authenticated	authenticated	admin@loanplatform.com	$2a$10$EbIq1hy9BHYW2y4KsyMxau4iyF.QCKZ1xhYdslaCzF9/zyVPCM.uK	2025-10-23 13:03:17.545713+00	\N		\N		\N			\N	2026-01-16 18:42:10.460981+00	{"provider": "email", "providers": ["email"]}	{"role": "super_admin", "phone": "(555) 000-0000", "last_name": "Admin", "first_name": "Super", "email_verified": true}	\N	2025-10-23 13:03:17.491293+00	2026-01-17 15:59:42.043091+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	2305fed5-ed7c-42ee-99db-3223e3b2ea06	authenticated	authenticated	rabiuddin1@gmail.com	$2a$10$shorMPnbdMoklcGx9vCakeT5Pt9emNqsVAsgwFECLTG6lZDmeP2QC	2026-01-06 13:43:21.175492+00	2026-01-06 13:43:00.4677+00		\N		\N			\N	2026-02-03 11:06:37.212314+00	{"provider": "email", "providers": ["email"]}	{"role": "company_admin", "company_id": "fb47ea33-5d83-4a8b-b670-b0ee993e36d0", "company_name": "Rabi's Company", "email_verified": true}	\N	2026-01-06 13:43:00.461815+00	2026-02-03 11:06:37.225902+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	authenticated	authenticated	l227870@lhr.nu.edu.pk	$2a$10$JN7fDhrS4elSxuGnqQ00sOOdSDe/t2amNZQzm6L4xgo3nIATYGNFG	2026-01-06 15:03:12.812109+00	2026-01-06 15:02:47.999441+00		\N		\N			\N	2026-02-07 20:46:39.317403+00	{"provider": "email", "providers": ["email"]}	{"role": "employee", "last_name": "Uddin", "company_id": "fb47ea33-5d83-4a8b-b670-b0ee993e36d0", "first_name": "Rabi", "email_verified": true}	\N	2026-01-06 15:02:47.955129+00	2026-02-07 20:46:39.395169+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: analytics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analytics (id, company_id, officer_id, event, data, user_agent, ip_address, referrer, session_id, created_at) FROM stdin;
\.


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.api_keys (id, company_id, name, service, key_value, is_active, last_used_at, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, name, slug, logo, website, license_number, address, phone, email, subscription, subscription_expires_at, is_active, settings, created_at, updated_at, admin_email, admin_email_verified, admin_user_id, invite_status, invite_sent_at, invite_expires_at, invite_token, deactivated, company_tagline, company_description, company_nmls_number, company_established_year, company_team_size, company_specialties, company_awards, company_testimonials, company_social_media, company_branding, company_contact_info, company_business_hours, company_service_areas, company_languages, company_certifications, company_insurance_info, company_financial_info, company_marketing_info, company_privacy_settings, company_seo_settings, company_analytics_settings, company_integration_settings, company_notification_settings, company_backup_settings, company_security_settings, company_compliance_settings, company_custom_fields, company_metadata, company_version, company_last_updated_by, company_approval_status, company_approval_notes, company_approval_date, company_approval_by, has_default_content_access) FROM stdin;
8397bc63-e24e-4897-ad56-4d48d6efd130	sudostudy	sudostudy	\N		\N	\N	\N	abdulrehman@sudostudy.com	basic	\N	t	{}	2025-10-23 13:04:54.309972	2025-10-23 13:06:01.223	abdulrehman@sudostudy.com	t	b6a99233-868e-4743-9b8e-40223fb4f9e8	accepted	2025-10-23 13:04:54.255	2025-10-24 13:04:54.255	b20a5fe2fe0bbe8f933601bbf8413580b839c515de1aa85a81acdb53c8094fd7	f	\N	\N	\N	\N	\N	[]	[]	[]	{}	{}	{}	{}	[]	[]	[]	{}	{}	{}	{}	{}	{}	{}	{}	{}	{}	{}	{}	{}	1	\N	pending	\N	\N	\N	f
fb47ea33-5d83-4a8b-b670-b0ee993e36d0	Rabi's Company	rabi's-company	\N		\N	\N	\N	rabiuddin1@gmail.com	basic	\N	t	{}	2026-01-06 13:43:00.088813	2026-01-06 13:43:30.986	rabiuddin1@gmail.com	t	2305fed5-ed7c-42ee-99db-3223e3b2ea06	accepted	2026-01-06 13:42:59.956	2026-01-07 13:42:59.956	5a2d8b9bb2bff2d445b8152bf942dc9bd14600cbb858e4d6fbbf028640e83a62	f	\N	\N	\N	\N	\N	[]	[]	[]	{}	{}	{}	{}	[]	[]	[]	{}	{}	{}	{}	{}	{}	{}	{}	{}	{}	{}	{}	{}	1	\N	pending	\N	\N	\N	t
\.


--
-- Data for Name: email_verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_verifications (id, email, verification_code, code_expires_at, is_verified, verified_at, created_at, updated_at) FROM stdin;
05bd85e6-f3df-401c-9842-34735f8d03cf	contact@theloanstar.com	482213	2026-02-01 19:44:18.56	t	2026-02-01 19:39:40.499	2026-02-01 19:39:20.834431	2026-02-01 19:39:40.499
6f15ceff-d92d-4d15-9094-e312a3f5bab5	effectedars29@gmail.com	904249	2026-02-03 09:09:58.09	t	2026-02-03 09:05:46.609	2026-02-03 09:04:59.143574	2026-02-03 09:05:46.609
75898dba-1817-477f-a758-c4fe5fdc0a50	rjvasque@ilcloud.com	471020	2026-01-19 19:14:15.246	f	\N	2026-01-19 19:09:15.792645	2026-01-19 19:09:15.792645
eb5f0958-0a1c-41cc-81ee-3a97c219ed59	rabiuddin1@gmail.com	446479	2026-01-21 19:13:18.812	t	2026-01-21 19:10:01.266	2026-01-15 12:31:25.184715	2026-01-21 19:10:01.266
7f80dd2b-ff17-476a-b716-25edd25c78d6	rjvasque@icloiud.com	109298	2026-01-22 21:12:55.65	f	\N	2026-01-22 21:07:57.853191	2026-01-22 21:07:57.853191
986a8728-6354-47ec-93b4-38e53ad488a2	rjvasque@icloud.com	834338	2026-01-23 00:27:36.267	t	2026-01-23 00:23:51.252	2026-01-19 20:13:47.009924	2026-01-23 00:23:51.252
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leads (id, company_id, officer_id, first_name, last_name, email, phone, source, status, priority, loan_details, property_details, credit_score, loan_amount, down_payment, notes, tags, custom_fields, created_at, updated_at, conversion_stage, conversion_date, application_date, approval_date, closing_date, loan_amount_closed, commission_earned, response_time_hours, last_contact_date, contact_count, lead_quality_score, geographic_location) FROM stdin;
a7593d6c-9fd4-4dbe-bc05-31f645b020d2	8397bc63-e24e-4897-ad56-4d48d6efd130	11181907-e372-48c9-8f40-26a675d37a57	ars	hehe	dummy@gmail.com	12345678	Rate Results Table	qualified	low	{"apr": 6.5, "fees": 0, "points": 0, "credits": 0, "loanTerm": 30, "loanType": "30-Year Fixed", "productId": "99999999-0-6.25-6.5", "lenderName": "Today's Rates", "lockPeriod": 30, "loanProgram": "30-Year Fixed", "interestRate": 6.25, "monthlyPayment": 925}	\N	700	27750.00	0.00	Lead generated from rate table. Product: 30-Year Fixed from Today's Rates	[]	{}	2025-10-23 14:22:34.378	2025-11-04 12:59:15.159	application	\N	2025-11-04 12:59:15.159	2025-11-04 11:06:23.441	\N	\N	\N	\N	\N	0	8	\N
5fdaa4d6-b3f5-425c-87fa-da4852ceb4b1	8397bc63-e24e-4897-ad56-4d48d6efd130	11181907-e372-48c9-8f40-26a675d37a57	John	Doe	contact@theloanstar.com	9162770717	Rate Results Table	new	medium	{"apr": 5.704, "fees": 0, "points": 2, "credits": 0, "loanTerm": 30, "loanType": "Conforming FHLMC 30 Yr Fixed", "productId": "1353", "lenderName": "Today's Rates", "lockPeriod": 30, "loanProgram": "Conforming FHLMC 30 Yr Fixed", "interestRate": 5.49, "monthlyPayment": 2694.02}	\N	780	80820.60	0.00	Lead generated from rate table. Product: Conforming FHLMC 30 Yr Fixed from Today's Rates	[]	{}	2025-11-24 16:44:44.029	2025-11-24 16:46:15.308	lead	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N
8aa3d7f0-5b07-4a47-af82-5382a823f457	8397bc63-e24e-4897-ad56-4d48d6efd130	11181907-e372-48c9-8f40-26a675d37a57	Ricky	Vasquez	contact@theloanstar.com	9162770717	Rate Results Table	new	medium	{"apr": 5.351, "fees": 0, "points": 2, "credits": 0, "loanTerm": 30, "loanType": "FNMA 30 Yr Fixed Agency", "productId": "4", "lenderName": "Today's Rates", "lockPeriod": 30, "loanProgram": "FNMA 30 Yr Fixed Agency", "interestRate": 5.125, "monthlyPayment": 816.73}	\N	780	24501.90	0.00	Lead generated from rate table. Product: FNMA 30 Yr Fixed Agency from Today's Rates	[]	{}	2025-11-27 00:59:13.556	2025-11-27 00:59:13.556	lead	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N
0f79b079-4a63-488a-93aa-0002ab8a71e1	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Muhammad	Rabi Uddin	rabiuddin1@gmail.com	1234567890	Rate Results Table	new	medium	{"apr": 5.214, "fees": [{"amount": 0, "prepaid": false, "section": "", "description": "", "paymentType": ""}], "points": 1, "credits": 0, "loanTerm": "30 ", "loanType": "Fixed", "productId": "4", "lenderName": "Today's Rates", "lockPeriod": 30, "loanProgram": "Conf 30 Yr Fixed ", "interestRate": 5.125, "monthlyPayment": 762.28}	\N	700	140000.00	85000.00	Lead generated from rate table. Product: Conf 30 Yr Fixed  from Today's Rates	[]	{}	2026-01-16 05:09:59.722	2026-01-19 20:44:34.15	application	\N	2026-01-19 20:44:34.15	\N	\N	\N	\N	\N	\N	0	\N	\N
d16205a9-7a49-4293-936a-6908b6eaacd7	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Rabi	Uddin	rabiuddin1@gmail.com	123456789	email_verification	new	medium	{"apr": 0, "fees": 0, "points": 0, "credits": 0, "loanTerm": 0, "loanType": "", "productId": "", "lenderName": "", "lockPeriod": 0, "loanProgram": "", "interestRate": 0, "monthlyPayment": 0}	\N	0	0.00	0.00	Lead generated from rate table. Product:  from 	[]	{}	2026-01-21 19:10:01.953	2026-01-21 19:10:01.953	lead	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N
aaebd8f1-3ec1-4fbc-b884-62fb77d12416	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Ricky	Vasquez	rjvasque@icloud.com	2094894492	email_verification	new	medium	{"apr": 0, "fees": 0, "points": 0, "credits": 0, "loanTerm": 0, "loanType": "", "productId": "", "lenderName": "", "lockPeriod": 0, "loanProgram": "", "interestRate": 0, "monthlyPayment": 0}	\N	0	0.00	0.00	Lead generated from rate table. Product:  from 	[]	{}	2026-01-22 21:13:45.31	2026-01-22 21:13:45.31	lead	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N
9f3bda94-2a4a-4956-869f-8357505a16f9	8397bc63-e24e-4897-ad56-4d48d6efd130	11181907-e372-48c9-8f40-26a675d37a57	Ricky	Vasquez	rjvasque@icloud.com	2094894492	email_verification	new	medium	{"apr": 0, "fees": 0, "points": 0, "credits": 0, "loanTerm": 0, "loanType": "", "productId": "", "lenderName": "", "lockPeriod": 0, "loanProgram": "", "interestRate": 0, "monthlyPayment": 0}	\N	0	0.00	0.00	Lead generated from rate table. Product:  from 	[]	{}	2026-01-23 00:23:51.862	2026-01-23 00:23:51.862	lead	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N
2afefb43-1907-441d-9d68-6ff3cb078cf4	8397bc63-e24e-4897-ad56-4d48d6efd130	11181907-e372-48c9-8f40-26a675d37a57	Ricky	Vasquez	contact@theloanstar.com	9162770717	email_verification	new	medium	{"apr": 0, "fees": 0, "points": 0, "credits": 0, "loanTerm": 0, "loanType": "", "productId": "", "lenderName": "", "lockPeriod": 0, "loanProgram": "", "interestRate": 0, "monthlyPayment": 0}	\N	0	0.00	0.00	Lead generated from rate table. Product:  from 	[]	{}	2026-02-01 19:39:41.321	2026-02-01 19:39:41.321	lead	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N
b1f3c1b1-54d7-461f-932f-d5f632748c84	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	ars	User	effectedars29@gmail.com	097654312	email_verification	new	medium	{"apr": 0, "fees": 0, "points": 0, "credits": 0, "loanTerm": 0, "loanType": "", "productId": "", "lenderName": "", "lockPeriod": 0, "loanProgram": "", "interestRate": 0, "monthlyPayment": 0}	\N	0	0.00	0.00	Lead generated from rate table. Product:  from 	[]	{}	2026-02-03 09:05:48.299	2026-02-03 09:05:48.299	lead	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N
\.


--
-- Data for Name: loan_officer_public_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_officer_public_links (id, user_id, company_id, created_at, public_slug, is_active, expires_at, max_uses, current_uses, updated_at) FROM stdin;
58c7f336-2f1f-4998-9d02-57c9b5d2466b	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-01-06 15:04:49.984579	0b4cb424-mk2q0np8	t	\N	\N	301	2026-02-08 15:35:04.08
2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	11181907-e372-48c9-8f40-26a675d37a57	8397bc63-e24e-4897-ad56-4d48d6efd130	2025-10-23 13:23:39.354641	11181907-mh3gdnm4	t	\N	\N	178	2026-02-01 19:38:06.509
395b193d-6712-479e-8e19-42abd8fb443e	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-03 09:52:16.069833	38b56d65-ml6f6jqw	t	\N	\N	1	2026-02-03 09:52:29.507
\.


--
-- Data for Name: mortech_api_calls; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mortech_api_calls (id, officer_id, company_id, called_at, search_params) FROM stdin;
c3339bdd-9daf-4e82-bd15-0506c5bb5e33	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-01-30 20:32:18.442	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 800, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
fcb7a465-e8de-41d3-83e1-2f0e845b9e86	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-01 11:11:53.383	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 800, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
56b9831f-a6eb-48cd-b1ea-b09cfa4788b5	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-01 11:53:08.54	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 800, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
c9ab0d5f-83df-4b0b-b242-ac004184b5c0	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-01 19:31:08.449	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 720, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
1be97a88-c01c-4eb9-8bec-4e6d9996c9ca	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-01 19:32:00.456	{"occupancy": "Primary", "propertyZip": "95688", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 475000, "finalCreditScore": 800, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 550000}
24c957e6-3f37-416b-9c63-ca7a4a9ef08a	11181907-e372-48c9-8f40-26a675d37a57	8397bc63-e24e-4897-ad56-4d48d6efd130	2026-02-01 19:36:03.143	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 720, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
247a4436-8722-4015-b005-25f378841733	11181907-e372-48c9-8f40-26a675d37a57	8397bc63-e24e-4897-ad56-4d48d6efd130	2026-02-01 19:36:19.829	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 720, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
b841a00a-aea8-4854-9d32-35fc183e569d	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-02 20:36:23.453	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 720, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
60f44eef-f345-4faa-9d97-1440f839073c	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-02 20:36:57.225	{"occupancy": "Primary", "propertyZip": "95688", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 475000, "finalCreditScore": 780, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 550000}
6ffd7e6e-99f3-4cb7-bd70-65831ddee40b	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-03 05:14:18.97	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 218250, "finalCreditScore": 620, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
34137cb2-7fa7-4146-982b-f232b1afdc9e	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-03 05:14:52.623	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 218250, "finalCreditScore": 760, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
f5550f1d-7e50-435b-ac4c-6e44c5c6a18b	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-03 05:15:45.264	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "20 year fixed", "finalLoanAmount": 108250, "finalCreditScore": 760, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 125000}
a53781bc-61e3-4c41-8470-16e99fcb3b7d	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-03 05:16:25.173	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 360000, "finalCreditScore": 740, "finalLoanPurpose": "Refinance", "finalPropertyType": "Single Family", "finalPropertyValue": 360000}
b605a76f-480b-444a-80dd-fe7d3d318edd	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-03 05:19:23.032	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 360000, "finalCreditScore": 740, "finalLoanPurpose": "Refinance", "finalPropertyType": "Single Family", "finalPropertyValue": 360000}
87ccc7c5-38e9-444e-9cce-551f5d8803e3	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-03 05:19:47.772	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 740, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
07f16177-834a-4683-8be8-ec7fc7745542	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-03 05:20:27.474	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 360000, "finalCreditScore": 740, "finalLoanPurpose": "Refinance", "finalPropertyType": "Single Family", "finalPropertyValue": 360000}
d6130bc0-eccf-4eef-97a1-cb43cff5921e	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-03 05:21:15.012	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 720, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
406e749b-5449-4524-80c6-2eaad432ca6b	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-04 02:19:05.642	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 720, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
18c53af1-3118-4f9b-97a2-747ab1d6f4c9	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-04 14:48:01.305	{"occupancy": "Primary", "propertyZip": "95825", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 800, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
1e082fd9-be2f-4811-89e8-cefcd690de69	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-05 19:15:47.956	{"occupancy": "Primary", "propertyZip": "95825", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 800, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
5981e2a3-15ae-4995-be5f-7f7488b59f3d	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-05 19:16:35.732	{"occupancy": "Primary", "propertyZip": "95825", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 120000, "finalCreditScore": 800, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 125000}
d2bcc3d1-de59-473a-b08c-13d6235e9998	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-05 19:16:59.041	{"occupancy": "Primary", "propertyZip": "95825", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 110000, "finalCreditScore": 800, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 125000}
bfd728c5-194c-4ad9-9bc2-f5ac9f761459	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-05 19:18:37.032	{"occupancy": "Primary", "propertyZip": "95825", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 800, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
4c409788-8f0a-4638-afa1-e81319b18fab	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-05 20:03:52.781	{"occupancy": "Primary", "propertyZip": "95825", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 800, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
fa52604d-7958-4f05-bf6c-b993b4ed4164	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	2026-02-06 11:17:04.403	{"occupancy": "Primary", "propertyZip": "95825", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 800, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
\.


--
-- Data for Name: mortech_email_rate_limits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mortech_email_rate_limits (id, email, called_at, search_params) FROM stdin;
60a4963f-3384-4ed2-ab68-d93ed26c80b3	rabiuddin1@gmail.com	2026-01-18 21:34:13.239	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 700, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
9351109d-1411-417a-9c5d-2c241acfdf06	rabiuddin1@gmail.com	2026-01-18 21:35:28.798	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 700, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
9963398e-9e4e-493a-a1da-c0faf4967380	rabiuddin1@gmail.com	2026-01-19 19:53:16.239	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 700, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
27a95df2-1f3a-4edf-b10a-48c10b2ed3a0	rjvasque@icloud.com	2026-01-19 20:15:18.929	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 720, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
9c24a301-a2d6-4b7d-a4d9-78ff5a2df913	rjvasque@icloud.com	2026-01-19 20:40:47.136	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 720, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
76c9a45d-fcd3-4641-b2df-9514cfa64249	rabiuddin1@gmail.com	2026-01-21 18:56:45.897	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 700, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
889fe816-d0bb-4586-87fa-c0c92824bcb5	rabiuddin1@gmail.com	2026-01-21 19:10:09.63	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 700, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
01cbb496-8142-4589-8b6b-c949eec17950	rjvasque@icloud.com	2026-01-22 21:13:48.597	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 720, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
7b661f18-154a-4c67-bc42-bb56554173cd	rjvasque@icloud.com	2026-01-22 21:14:17.327	{"occupancy": "Primary", "propertyZip": "95688", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 700000, "finalCreditScore": 780, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 775000}
c4269135-406b-414f-be49-c887606b81cf	rjvasque@icloud.com	2026-01-23 00:23:55.031	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 720, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
64a67b76-3579-44a0-aa4c-902bf56a6394	contact@theloanstar.com	2026-02-01 19:39:44.208	{"occupancy": "Primary", "propertyZip": "75024", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 720, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
efa54535-3b7f-47fd-ae86-39bd8b9197c1	contact@theloanstar.com	2026-02-01 19:40:11.501	{"occupancy": "Primary", "propertyZip": "95688", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 675000, "finalCreditScore": 780, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 750000}
e002bb21-4159-4268-b991-d7e4ef86d5ad	contact@theloanstar.com	2026-02-01 19:40:31.509	{"occupancy": "Primary", "propertyZip": "95688", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 675000, "finalCreditScore": 640, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 750000}
ea6cbc6d-f846-4ef4-b67f-0d3aa6fd704b	effectedars29@gmail.com	2026-02-03 09:05:53.198	{"occupancy": "Primary", "propertyZip": "95825", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 150000, "finalCreditScore": 740, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 225000}
a5a2f4ca-d6a6-4bd4-86d9-4fde0fb473f0	effectedars29@gmail.com	2026-02-03 09:06:22.413	{"occupancy": "Primary", "propertyZip": "95825", "finalLoanTerm": "30 year fixed", "finalLoanAmount": 110000, "finalCreditScore": 740, "finalLoanPurpose": "Purchase", "finalPropertyType": "Single Family", "finalPropertyValue": 125000}
\.


--
-- Data for Name: officer_content_faqs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.officer_content_faqs (id, officer_id, question, answer, category, created_at, updated_at) FROM stdin;
1748357f-6179-471f-a762-1f54dd23f734	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What does "closing" on a home mean in the mortgage process?	Closing is the final step where you sign all loan and title documents, pay any remaining funds, and the lender authorizes disbursement so ownership and the mortgage become official.	process	2026-01-06 15:03:37.114	2026-01-06 15:03:37.114
909bddbd-9ca9-4cff-b0c6-5e2a79696d92	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How long after final loan approval does closing usually take place?	Once you are clear-to-close, many loans close within a few days to a week, depending on scheduling with the title or escrow company and all parties involved.	process	2026-01-06 15:03:37.114	2026-01-06 15:03:37.114
5d2fddd1-c53f-4fe8-9de4-96a66ebf5c7d	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What are the main steps between receiving "clear-to-close" and getting the keys to my home?	After clear-to-close, your lender sends final documents to the closing agent, you review your Closing Disclosure, sign at closing, the loan funds, and once the deed records, you receive the keys.	process	2026-01-06 15:03:37.114	2026-01-06 15:03:37.114
deb3f8af-77b8-4abe-89a4-bc85668e953c	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is the difference between closing and funding of my mortgage?	Closing is when you sign the documents, while funding is when the lender actually releases the loan money; in many purchases, funding and recording follow shortly after signing.	process	2026-01-06 15:03:37.114	2026-01-06 15:03:37.114
76a62f46-b259-4f2d-98bd-9e68beee6320	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is a Closing Disclosure, and why must I receive it a few days before closing?	The Closing Disclosure summarizes your final loan terms and costs and must be provided in advance so you have time to review and compare it with your earlier Loan Estimate before signing.	process	2026-01-06 15:03:37.114	2026-01-06 15:03:37.114
2aa138a1-6e29-4d21-85f4-ef484af7bf41	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What should I review carefully on my Closing Disclosure before I sign my mortgage documents?	Check your interest rate, monthly payment, cash to close, closing costs, prepaids, and whether any credits or seller contributions match your purchase agreement and expectations.	process	2026-01-06 15:03:37.114	2026-01-06 15:03:37.114
8ba0c1b2-b884-4802-9392-f3efe12dc4fd	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How much money do I need to bring to closing, and when will I know the final amount?	Your Closing Disclosure and settlement statement show the exact cash to close, including down payment and costs; your closing agent or lender will confirm the final figure before signing day.	process	2026-01-06 15:03:37.114	2026-01-06 15:03:37.114
2dd86ff0-cbef-4d96-a567-700f06a44fb3	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Can I use a personal check, or do I need a wire or cashier's check for my closing funds?	Most closings require certified funds, such as a wire transfer or cashier's check, because personal checks can delay funding or be subject to holds by the bank.	process	2026-01-06 15:03:37.114	2026-01-06 15:03:37.114
b5100139-8f27-45f5-afff-bb0cd76da339	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What documents will I sign at closing for my mortgage and the property transfer?	Typical documents include the promissory note, mortgage or deed of trust, Closing Disclosure, affidavits, and title or deed paperwork that transfers ownership into your name.	process	2026-01-06 15:03:37.114	2026-01-06 15:03:37.114
bb7bc1bb-eea1-489b-816a-ff6dd69716ec	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Who typically attends the closing—lender, escrow officer, real estate agents, buyers, and sellers?	Depending on your state and closing type, you may meet with an escrow or title officer, notary, possibly your agent, and sometimes the seller; lenders often prepare documents but do not always attend in person.	process	2026-01-06 15:03:37.114	2026-01-06 15:03:37.114
26d1174f-2c95-4049-86a4-ee98e2017ce0	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What happens if my income, credit, or debt changes right before closing day?	Significant changes can trigger a new review and, in some cases, alter or delay your approval, so you should notify your lender immediately if anything major changes before closing.	process	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
9cebfef7-cc1b-474c-a653-9c14ed52ca6e	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Can the lender re-verify my employment or recheck my credit again just before closing?	Yes, many lenders perform a final employment verification and may check for new credit or debts shortly before funding to confirm nothing has changed that would affect your qualification.	process	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
83b63236-e3fb-49c0-a086-287bf429b2eb	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What could cause my closing to be delayed or rescheduled at the last minute?	Common causes include missing documents, unresolved conditions, wire or banking issues, title or insurance problems, appraisal questions, or last-minute changes to terms that require updated disclosures or approvals.	process	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
f121de1a-ecaf-4124-b08f-a5e0233d077f	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How can title issues or last-minute appraisal questions impact my closing timeline?	Unresolved liens, ownership disputes, or value concerns may require additional documentation, corrections, or reconsideration, and closing cannot occur until the title and value meet the lender's requirements.	process	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
965d566d-65b2-4f56-b050-4ad47ae38df8	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	When do property taxes, homeowner's insurance, and mortgage insurance start being collected with my payment?	Initial amounts are often collected at closing to fund your escrow account, and ongoing escrows are then included in your monthly mortgage payment beginning with your first scheduled payment.	process	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
5c450669-556b-4da9-ab08-28f60c15171d	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is the role of the escrow or settlement agent in the closing process for my mortgage?	The escrow or settlement agent coordinates documents, collects and disburses funds, ensures all conditions are met, and handles recording of the deed and mortgage with the appropriate authorities.	process	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
a86fc66e-6767-4db7-a827-e6b1c569c760	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	When will my first mortgage payment be due after closing, and how is that date determined?	Your first payment is usually due on the first of the second month after closing, because mortgage interest is paid in arrears and some interest is collected for the closing month at the signing.	process	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
bb4bda28-9fcd-4a69-8ef2-cc2b716be443	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What should I avoid doing financially in the days leading up to my closing appointment?	Avoid opening new credit, making large purchases, moving large sums without documentation, or missing any payments, as these can prompt additional questions or affect your final approval.	process	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
d04f6730-8117-4bc2-a545-7bf12d9cc03f	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	After closing, will my mortgage stay with the same lender or be sold to another company to service?	Many loans are sold or the servicing is transferred after closing; if that happens, you will receive written notice explaining where to send payments and how to manage your account going forward.	process	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
b4b0af08-aaa7-441d-bbed-99e6aab04648	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What should I do if I find an error on my closing documents on the day of signing?	Pause and alert your closing agent and lender immediately so they can correct and re-issue any affected documents; do not sign paperwork you believe is inaccurate or incomplete.	process	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
5e6cdd95-1399-4aad-a405-382b428e7a06	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What are the main steps of the mortgage application process from start to finish?	The core steps are pre-approval, formal application, documentation review, underwriting, appraisal, final approval (clear-to-close), signing closing documents, and funding of the loan.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
237db353-b37e-410d-bad6-68d8f12b6977	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	When should I apply for a mortgage—before or after I start shopping for homes?	It is best to get pre-approved before home shopping so you know your price range and can submit stronger offers backed by a lender letter.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
83558131-a38a-4931-ab3e-522413c72693	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What information and documents do I need to complete a mortgage application?	Most borrowers provide identification, income documents, tax returns, bank statements, details on assets and debts, and information about the property being purchased or refinanced.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
7e032b99-88ad-4cb0-9f74-50f960f1875d	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How long does it typically take to get a mortgage application approved and closed?	Many loans close in about 30 to 45 days from a complete application, though timing depends on how quickly documents, appraisal, and title work are completed.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
6041dcb3-e582-481a-b169-6436958a985a	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is the difference between pre-qualification, pre-approval, and full loan approval?	Pre-qualification is an informal estimate, pre-approval includes a credit check and document review, and full approval happens after underwriting, appraisal, and final conditions are satisfied.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
4b47f583-aa97-4255-b0d1-2f54e3ea90b2	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	At what point does the lender pull my credit, and will they check it again before closing?	Credit is usually pulled at pre-approval or application, and many lenders perform a final check or monitoring before closing to confirm no major new debts or issues have appeared.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
18d5b494-e40c-4c5a-910a-170cc95df6bb	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What happens after I submit my mortgage application and upload my documents online?	Your file typically moves to processing, where your information is organized and verified, then to underwriting, where an underwriter reviews credit, income, assets, and the property to decide on approval conditions.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
57a85682-ba1c-4989-b685-e1b8e6e4590e	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is mortgage underwriting, and what does an underwriter actually review?	Underwriting is the lender's risk review; the underwriter examines your credit, income, assets, debts, employment, and appraisal to ensure the loan meets program guidelines and the lender's standards.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
e7d08d56-dc57-4c8d-8631-3f118e6a6506	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What are "conditions" in underwriting, and how do I clear them to move forward?	Conditions are items the underwriter needs before final approval, such as updated documents or explanations; once you provide and the lender accepts them, your file can move to clear-to-close status.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
163a1b11-521e-4cdd-9da7-44a4d412834f	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How do appraisals fit into the loan process, and what if the appraisal comes in low?	The appraisal confirms the property's value for the lender; if it is low, you may renegotiate the price, increase your down payment, challenge the appraisal, or cancel based on your contract terms.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
a57b47a4-c4ef-4d99-a610-c577d748f024	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	When do I receive a Loan Estimate, and what should I look for on it?	You should receive a Loan Estimate within a few business days of your application, outlining your projected rate, payment, and closing costs so you can compare offers and understand key terms early.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
51ca5269-01af-4b90-b83c-07594bb0effd	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is a Closing Disclosure, and when will I receive it before signing my loan?	The Closing Disclosure is a final, detailed summary of your loan terms and costs that must be provided at least three business days before closing so you can review everything before signing.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
9bb4126d-da00-42a0-9076-c3dd2b0a9244	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How often will I need to update pay stubs, bank statements, or other documents during the process?	Lenders commonly require documents to be current within a set timeframe, so you may be asked for updated pay stubs or statements if your file is in process for several weeks or more.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
8c6f5398-8944-4984-92cd-cf84a63d908e	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Can I change jobs, move money, or make large deposits while my mortgage is in process?	Major job changes, transfers between accounts, or large unexplained deposits can require extra documentation or affect approval, so talk with your lender before making any significant changes during the process.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
5b11e940-1ca6-4645-9dd7-d2d7dacfde56	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What actions could delay or jeopardize my mortgage approval once I have applied?	New debts, missed payments, big purchases, unverified deposits, or slow responses to document requests can delay or harm your approval, so consistent finances and quick communication are important.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
264f0b87-2edb-4774-8c36-356af21829e3	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Who will be my main point of contact during the mortgage application process?	You will typically work with a loan officer and a loan processor, who coordinate with underwriting and keep you updated on needed items and milestones through to closing.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
b241dbec-b50e-468a-8f5f-d37bc74bcbfd	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How can I track the status of my mortgage application and know what is still outstanding?	Many lenders offer online portals showing tasks and documents, and you can also request status updates from your loan team to see what has been completed and what remains.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
e6ce4b54-dad0-45e3-a7da-be66eab43bd7	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What happens if my income, debt, or credit changes before my loan closes?	Material changes may require re-underwriting your file and could alter your approval or terms, so it is important to alert your lender immediately if your situation changes.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
fb1e80fe-48db-457e-b8ca-a54df7204c84	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is a conditional loan approval versus a clear-to-close status?	Conditional approval means the underwriter has approved your loan subject to specific conditions; clear-to-close confirms all conditions are met and your loan is ready for closing and funding.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
15b9817f-c278-4bd4-bc76-cd2f576896b3	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	On closing day, what should I expect in terms of signing documents and funding my loan?	On closing day you will review and sign final loan and title documents, provide any required funds by wire or cashier's check, and after funding and recording, you become the official owner.	application	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
b4190c2e-14ab-456a-8fc8-5a730ea58407	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What types of mortgage financing options are available for homebuyers?	Common financing options include conventional loans, FHA loans, VA loans, USDA loans, and jumbo loans, each with different down payment, credit, and occupancy requirements.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
0280735a-46ca-4677-8211-99c334673e8f	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How do I decide between a conventional loan, FHA, VA, or other loan program?	The best program depends on your credit, down payment, military status, property location, and long-term goals; your lender can compare monthly payments, fees, and qualification rules for each.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
29b931eb-7295-4bbd-8b87-aacda7a99cf6	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is the difference between a fixed-rate and an adjustable-rate mortgage from a financing standpoint?	A fixed-rate mortgage keeps the same interest rate and principal-and-interest payment for the entire term, while an adjustable-rate mortgage starts with a fixed period and then can adjust based on a market index.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
45134748-2361-4732-8207-2d0e9ceed78e	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How do lenders calculate my debt-to-income (DTI) ratio for mortgage approval?	Lenders add up your monthly debts shown on your credit report plus your proposed housing payment, then divide that total by your gross monthly income to determine your DTI percentage.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
4e6dda57-d5ee-4737-82e3-08ab5633e145	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What DTI ratio do most lenders look for when approving a home loan?	Acceptable DTI limits vary by program, but many loans target total DTI at or below the low-40% range, with some allowing higher ratios when there are strong compensating factors.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
b3be338f-e2a4-4e8b-9adb-5aee02364eb9	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How does my employment history and income type affect my financing options?	Stable, documentable income over at least two years in the same line of work is preferred; self-employed or commission income may require additional tax returns and averaging rules to qualify.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
eb472c0b-3dca-4b99-91fe-5bc1524f1adb	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Can I use bonus, overtime, commission, or gig income to qualify for a mortgage?	Yes, if the income is consistent and documented over time; lenders usually average variable income over two years and verify it is likely to continue.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
59e725bb-5798-4170-9f96-2856baf550df	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is the minimum down payment required for different types of mortgage loans?	Many conventional loans start around 3% down, FHA often requires a minimum of 3.5%, VA and USDA can offer zero-down options for eligible borrowers and properties, and jumbo loans usually require more.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
fa513391-5516-497d-8f38-3bbdf933dcf8	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Can gift funds from family be used for my down payment or closing costs, and what documentation is needed?	Most programs allow properly documented gifts from acceptable donors, often requiring a signed gift letter and evidence of the transfer and source of funds according to the loan guidelines.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
749480d2-d5ab-4f81-973d-59599cc645ac	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is the difference between a pre-qualification and a full pre-approval from a financing perspective?	Pre-qualification is an informal estimate based on basic information, while pre-approval includes a credit check and review of documents, giving you a stronger, more reliable approval amount for offers.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
5bc7bb15-8af8-4505-b3ba-a9c97f7dbbc1	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How does my choice of loan term, such as 15-year vs. 30-year, affect my payment and total interest cost?	Shorter terms usually have higher monthly payments but lower interest rates and much less total interest over the life of the loan, while longer terms reduce the payment but increase overall interest paid.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
b8512261-57aa-4ff8-81fe-d761740eb334	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What are lender fees, and how do they differ from third-party closing costs in my loan estimate?	Lender fees are charges from the mortgage company, such as origination or underwriting, while third-party costs include appraisal, title, escrow, and government fees that are paid to outside providers.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
f707741b-d37f-4def-aab5-1cd44038b2f0	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is a rate lock, and when should I lock my interest rate during the financing process?	A rate lock is an agreement that secures a specific interest rate for a set period; many buyers lock after their offer is accepted and loan application is submitted so the rate cannot rise during processing.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
a35f4192-db29-4a41-8fed-96a3eb362a7e	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Can I change loan programs or terms after I have already applied or gone under contract?	Changes are often possible but may require a new loan estimate, updated underwriting, or an extension of deadlines, so any switch should be coordinated early with your lender and agent.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
6dbfef5d-d9e7-4ba5-8514-34422f39befd	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How do points or "buying down the rate" work, and when does it make financial sense?	Points are upfront fees paid to reduce your interest rate; whether it makes sense depends on how much you pay, how much the rate drops, and how long you expect to keep the loan before selling or refinancing.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
6278d5d8-ebdd-42d9-95bf-b50cde993ea5	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is mortgage insurance, when is it required, and how does it affect my monthly payment?	Mortgage insurance protects the lender when your down payment is below certain thresholds; it adds a monthly or upfront cost but can allow you to buy with less money down than would otherwise be required.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
9378b8bf-93b1-42f4-8620-eb4b0e5ad882	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Can I finance closing costs into my mortgage, or use lender or seller credits to reduce cash needed at closing?	Some loan programs allow limited financing of costs or the use of seller and lender credits, which can raise your interest rate or purchase price slightly but lower the cash you must bring to closing.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
e98bc8d8-cd09-428b-9ab9-fe01684bb9f8	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How does refinancing work, and when might it be a good idea after I purchase a home?	Refinancing replaces your current mortgage with a new one, potentially lowering your rate, changing your term, or accessing equity; it can be helpful when rates drop or your finances improve enough to offset closing costs.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
231c9900-850b-4409-aa39-c22c8fb25123	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Are there special financing options for investors, second homes, or multi-unit properties compared to primary residences?	Non-owner-occupied and second-home loans usually have different down payment, reserve, and pricing requirements, and financing for multi-unit properties may consider rental income and additional guidelines.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
853b8905-6e1e-47df-993e-5c2fbc0b6ba3	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Besides the interest rate, what other factors should I compare when choosing between mortgage offers?	Compare total lender fees, annual percentage rate (APR), mortgage insurance costs, loan term, prepayment rules, and credits or points so you understand the true overall cost of each option.	financing	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
f3b6d7e5-3061-49b5-bd51-b2b6b10c3021	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How does my credit score affect my ability to qualify for a mortgage?	Your credit score helps lenders measure how risky it is to lend to you; higher scores generally make it easier to qualify, often with lower interest rates and better terms.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
ddafab2b-b564-42a9-8e69-21267401368a	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What minimum credit score do most lenders require for a home loan?	Minimum scores vary by loan type and lender, but many conventional loans require scores in at least the mid-600s, while some government-backed programs may allow lower scores with other strong factors.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
415906ee-677d-4922-82fc-d0ba14ea1806	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Which credit score do lenders use when I apply for a mortgage?	Lenders typically pull scores from the three major credit bureaus and use a mortgage-specific scoring model, then base your qualification on the "middle" of those three scores.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
d39556c4-efb9-46de-bb31-9830c7f81e37	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Do lenders look at all three credit bureaus for a mortgage application?	Yes, most mortgage lenders request reports and scores from Experian, Equifax, and TransUnion to get a complete view of your credit history and obligations.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
28dc55ab-0f59-4735-ab56-5cedc674f556	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is my "middle score" and why does it matter for mortgage approval?	The middle score is the one that falls between your highest and lowest of the three bureau scores, and it is usually the key number lenders use for qualifying and pricing your loan.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
37aa611e-a89a-4167-9692-0b951f21f310	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Will my co-borrower's credit score affect our loan approval and interest rate?	When there are two borrowers, lenders typically use the lower middle score of the two, so a weaker score can impact loan options, pricing, or even eligibility.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
fe567fd2-f9ea-45cd-b95e-14c069c63471	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How does the length of my credit history impact my mortgage qualification?	A longer, well-managed credit history tends to be viewed more favorably, while very thin or new credit files may require stronger income, assets, or special programs to qualify.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
c9cdf0e4-d4a6-446c-8f97-be3f97c6a50a	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How do late payments, collections, or charge-offs affect getting approved for a mortgage?	Recent serious delinquencies can significantly lower your score and may trigger waiting periods or extra documentation, while older, resolved issues may have less impact if your recent history is strong.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
44b026e7-161e-4ec9-8f58-ccc9f41c9329	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Can I get a mortgage if I have a past bankruptcy, foreclosure, or short sale on my credit?	Many borrowers can qualify again after certain waiting periods and re-establishing good credit, with the length of time depending on the event type and the loan program you use.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
32b93365-463a-4d8a-8c89-e4eb7e839c5f	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How long after a bankruptcy or foreclosure do I need to wait before applying for a home loan?	Typical waiting periods range from about two to seven years, depending on whether it was a bankruptcy, foreclosure, or short sale and which loan type you are applying for; your lender can review your specific timeline.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
03c676ce-497b-4e42-b666-6f93542faf4c	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Does my credit card utilization ratio impact my mortgage approval and rate?	Yes, using a high percentage of your available revolving credit can lower your score, so keeping balances relatively low compared with limits can improve both qualification and potential pricing.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
3ef528f1-c531-4121-a6f1-a56178cfa6c5	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Should I pay down credit cards or other debts before applying for a mortgage to improve my chances?	Paying down revolving debt can help your score and reduce your debt-to-income ratio, but it is wise to review a plan with your lender first to prioritize which accounts to address.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
290b4220-cfc0-40dc-bd67-4570a3565429	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Will applying with multiple lenders hurt my credit score while I shop for a mortgage?	Several mortgage inquiries within a short rate-shopping window are often treated as one for scoring purposes, so comparing offers within a limited time usually has a small impact on your score.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
7c23c2f9-8af7-4209-8e98-e3218f78db22	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is the difference between a hard inquiry and a soft inquiry in the mortgage process?	A hard inquiry occurs when a lender pulls your credit for an application and can affect your score slightly, while a soft inquiry, such as some pre-approvals or self-checks, does not impact your score.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
b77a91b4-2f99-44d4-9874-c6ef04a36539	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How long do mortgage inquiries stay on my credit report and do they lower my score the whole time?	Inquiries usually remain visible for about two years, but their effect on your score is typically modest and tends to decrease after the first year as more recent behavior matters more.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
1ea388b6-eb04-4377-a8bf-1573bc81d959	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Should I open new credit accounts or finance a car while I am in the middle of a mortgage application?	Opening new credit or taking on new loans during the process can lower your score and raise your debt-to-income ratio, so most lenders advise waiting until after your home purchase closes.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
66e1c2ab-4c02-42cd-8460-5118c7d132fe	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Is it a good idea to close old credit cards before or during my loan process to clean up my credit?	Closing long-standing accounts can shorten your average credit history and raise utilization on remaining cards, which may hurt your score, so changes should be discussed with your lender before you act.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
a5dc73ff-0354-47d5-83aa-9e6835c5a5ff	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How quickly can my credit score improve if I pay down debt or correct errors before applying for a mortgage?	Some score changes may appear within a few weeks of balances updating or corrections posting, while rebuilding from serious issues can take many months; timing varies by your situation and reporting cycles.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
c9055a2a-657a-4e14-99a4-add3aa776034	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What should I do if I find an error on my credit report before applying for a home loan?	You can dispute inaccuracies directly with the credit bureaus and, when possible, provide supporting documents; share details with your lender as well so they understand what is being corrected.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
c86cf525-7d13-4dd0-a872-e0da486b9b9b	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Are there mortgage programs for borrowers with lower credit scores or limited credit history?	Some government-backed and specialty programs are designed for borrowers with less-than-perfect credit or thin files, often balancing credit with income, savings, and other compensating strengths.	credit	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
962b419c-8b75-4ba4-8210-6e7ac60a5ab1	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is a mortgage?	A mortgage is a loan used to buy real estate, where the property itself is collateral for the loan.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
e6ef4e99-7bb3-4fe2-8384-50cf8dd5531c	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How does a mortgage work?	You borrow money from a lender, repay it over time with interest, and the lender can take the property if you don't repay as agreed.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
c2ab8f0f-9f7a-4f9e-96c6-10412ad4c7db	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What types of mortgage loans are available?	Common types include fixed-rate, adjustable-rate (ARM), FHA, VA, USDA, and jumbo loans.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
f0935427-34dd-455a-9efe-ff04794944b9	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is the difference between a fixed-rate and an adjustable-rate mortgage?	Fixed-rate mortgages keep the same interest rate for the entire loan term, while adjustable rates can change over time.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
3a7c76b4-a1a4-4afd-8ba0-2b88cabc5f62	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is a down payment, and how much do I need?	A down payment is the amount you pay upfront, usually ranging from 3% to 20% of the home's price.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
1d16bb51-8595-43ca-b903-3381a076d7dc	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How do I qualify for a mortgage?	Lenders look at your credit score, income, debt, employment, and down payment to determine if you qualify.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
c3771c1d-73cd-4293-8eb8-c192659b505a	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is mortgage pre-approval?	Pre-approval means a lender has reviewed your finances and can offer you a specific loan amount, giving you a stronger buying position.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
247b66bc-8c61-47b7-abdf-9bf4ccb360e3	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How is my mortgage payment calculated?	Payments include loan principal, interest, property taxes, homeowner's insurance, and possibly mortgage insurance.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
b712fd03-a936-4562-bad4-7ea13073dd5d	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is included in my monthly mortgage payment?	Principal, interest, taxes, and insurance (PITI)—and sometimes PMI.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
a776b365-82ce-483f-8097-f01855f518a2	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is private mortgage insurance (PMI)?	PMI protects the lender if you default and is usually required if your down payment is less than 20%.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
21129a44-0a7e-4b11-a84d-9b1ccde83f5c	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How can I avoid paying PMI?	Make a down payment of at least 20%, or explore lender-paid PMI or piggyback loan options.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
2b71b1a9-3f05-4d76-a020-efa7ecc5f863	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What are closing costs and who pays them?	Closing costs include lender, title, and government fees (2-5% of price), and both buyer and seller may pay certain costs as negotiated.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
679d03bc-9aca-437d-8c5d-f791f2e0c2bc	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is an escrow account in relation to my mortgage?	An escrow account holds funds for property taxes and insurance to ensure they're paid on time.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
4791b8f3-1e15-43e1-9392-b1a5a55be884	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How do interest rates affect my mortgage?	Higher rates increase your monthly payment and the total cost of your loan. Lower rates do the opposite.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
a50f7a8e-27bc-4e5f-b0bf-03923a8ec002	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Can I get a mortgage with less than perfect credit?	Yes, but you may pay a higher interest rate or need a larger down payment. Some programs serve buyers with lower credit scores.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
6ed5ab9a-02b6-425a-8737-79fc9dd08eec	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What are points, and should I pay them?	Points are upfront payments to lower your interest rate. If you'll keep your loan long enough, paying points can save money.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
12e03a78-b52e-4463-ba80-f41d5e99d859	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What documents are required to apply for a mortgage?	Typically, you'll need pay stubs, W-2s, tax returns, bank statements, and ID. Self-employed borrowers may need more paperwork.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
bd589e89-bc2a-42d7-a3fd-fc8fbe7b6b51	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How long does it take to get approved for a mortgage?	30-45 days is common, but it varies. Getting your documents ready early can help speed things up.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
54738d20-1754-40f7-ae34-19357d6f529e	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Can I pay off my mortgage early?	Yes, in most cases. Check if your loan has a prepayment penalty. Paying early reduces your interest costs.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
683e6bbe-e57f-4b6c-be9d-bf8ffccefaba	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What happens if I miss a mortgage payment?	You'll likely owe a late fee and risk damage to your credit score. Multiple missed payments can lead to foreclosure.	mortgage-basics	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
7195736f-ff60-4410-aeeb-8b56f422d519	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What is the first step to buying my first home?	The first step is to review your budget and credit, then speak with a lender to get pre-approved so you know your price range and loan options.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
2da5397f-5aa7-4641-ac5f-118fcf4adbc6	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How much should I save for a down payment as a first-time buyer?	Many first-time buyers put between 3% and 5% down, though saving more can lower your payment and may reduce or remove mortgage insurance.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
fc4f4724-a2ac-4842-97fc-cdadd6a91fd3	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Are there special first-time homebuyer programs or down payment assistance options?	Many lenders, local governments, and housing agencies offer first-time buyer grants, forgivable loans, or reduced down payment programs based on income, location, or profession.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
1b529c89-a9a8-4073-ac74-7ef3f360296b	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What credit score do I need to buy my first home?	Minimum credit score requirements vary by loan type, but many first-time buyer programs start around the mid-600s, with stronger scores qualifying for better rates and terms.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
6309c1b7-e2d2-443d-872d-4a6b8f82f84f	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How long should I be at my job before applying as a first-time buyer?	Lenders typically like to see a two-year work history in the same field, though recent graduates or job changes within the same industry can often be acceptable with documentation.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
fc64b4d8-dc6c-464f-8c03-70a39882ba46	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How is buying my first home different from renting?	Buying usually involves upfront costs, maintenance responsibilities, and a longer commitment, but it also builds equity and can offer more stability and potential tax benefits than renting.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
61c1d293-9401-406c-a4dc-516997ececbd	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How do I choose the right lender as a first-time buyer?	Compare interest rates, fees, loan programs, and reviews, and look for a lender experienced with first-time buyers who can clearly explain your options and closing costs.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
2f57c66f-d220-4eb2-ba7f-405f76b173a1	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How do I know what price range is realistic for my first home?	Your pre-approval, monthly budget, and comfort level with payments together determine a realistic range; your agent can also show how taxes, HOA dues, and insurance affect affordability.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
a03179f0-fbfd-43d7-b67d-727632276c8f	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How much should I budget for closing costs on my first home purchase?	Closing costs typically run about 2% to 5% of the purchase price, and may be paid by you, shared with the seller, or partially covered by lender or assistance programs, depending on your contract.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
64f2635c-2c4e-431d-99bb-3ca5613b8426	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What monthly payment should I be comfortable with as a first-time buyer?	A common guideline is that your total housing payment fits comfortably within your budget after other debts and savings goals, often keeping your debt-to-income ratio within lender limits.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
ed371c63-4260-406d-b6aa-f1e06273755e	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What are the most common mistakes first-time homebuyers make?	Common missteps include skipping pre-approval, stretching the budget too far, waiving important inspections, making big purchases before closing, and not understanding loan terms or closing costs.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
7cdae408-0dae-4925-aebf-966dbd753a54	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How long does the process usually take for a first-time buyer from pre-approval to move-in?	Once pre-approved and under contract, many first-time buyers close in about 30 to 45 days, though searching for the right home can add additional time depending on the market.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
ef1e9228-ca4a-44f6-af6d-7e532ca62e4c	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Should I buy a "starter" home or wait until I can afford my long-term home?	A starter home can help you build equity sooner, while waiting may allow a larger budget; the best choice depends on your timeline, local prices, and how long you plan to stay in the home.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
48a11bcb-aeb0-41c1-82bd-dd4b1a77912f	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Is a fixed-rate or adjustable-rate mortgage better for first-time buyers?	Many first-time buyers prefer fixed-rate loans for payment stability, while adjustable-rate mortgages may be useful if you expect to move or refinance before the rate can adjust.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
f45a4e82-f1fe-4b81-9170-1a7fe425a6ed	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What inspections are especially important for first-time buyers before closing?	A general home inspection is standard, and depending on the property and location you may also consider roof, sewer, pest, foundation, or environmental inspections for added peace of mind.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
d5b61699-fd7f-42a1-84e4-5879ba1790c2	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	How much should I plan for repairs and maintenance on my first home each year?	A common rule of thumb is to budget around 1% of the home's value per year for maintenance and repairs, though older homes or special features may require more.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
d8cafd14-c3d5-404f-99e3-1313c037de64	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is a down payment, and how much do I need?	A down payment is the amount you pay upfront, usually ranging from 3% to 20% of the home's price.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
63cc70bd-569b-432b-981a-89d9b812368d	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Can I buy my first home if I have student loans or other debt?	Yes, as long as your total monthly debts, including your future mortgage payment, stay within the lender's debt-to-income guidelines and you meet credit and income requirements.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
c5237b78-6d78-4f30-9af4-183d59036b5d	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	What happens if the appraisal comes in lower than the price on my first home?	A low appraisal may lead to renegotiating the price, increasing your down payment, changing loan terms, or canceling based on your contract's appraisal contingency.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
a0bdddca-36c5-40d2-97e5-1a30bd1f1366	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Can I ask the seller for credits or help with closing costs as a first-time buyer?	Yes, you can request seller credits toward closing costs in your offer, subject to loan and seller limits, which can reduce the cash you need at closing.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
6c18ef11-bc25-4d81-862d-8f2d84911d8e	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Do I need a real estate agent for my first home purchase, and how are they paid?	An agent can guide you through pricing, contracts, and negotiations, and in most markets the seller pays the listing and buyer's agent commissions from the sale proceeds.	first-time-buyer	2026-01-06 15:03:37.115	2026-01-06 15:03:37.115
f5ae00f4-9e56-462f-8b59-1083d55d244c	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What does "closing" on a home mean in the mortgage process?	Closing is the final step where you sign all loan and title documents, pay any remaining funds, and the lender authorizes disbursement so ownership and the mortgage become official.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
51eb5805-fd01-492c-9009-10ccb3a5951f	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How long after final loan approval does closing usually take place?	Once you are clear-to-close, many loans close within a few days to a week, depending on scheduling with the title or escrow company and all parties involved.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
363aa60e-0fd8-4afa-bd2a-d8a53d194e93	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What are the main steps between receiving "clear-to-close" and getting the keys to my home?	After clear-to-close, your lender sends final documents to the closing agent, you review your Closing Disclosure, sign at closing, the loan funds, and once the deed records, you receive the keys.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
be124985-c81f-4298-a6b1-a22fa3b702f1	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is the difference between closing and funding of my mortgage?	Closing is when you sign the documents, while funding is when the lender actually releases the loan money; in many purchases, funding and recording follow shortly after signing.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
09feae51-0792-46d7-8621-2dff6a96a322	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is a Closing Disclosure, and why must I receive it a few days before closing?	The Closing Disclosure summarizes your final loan terms and costs and must be provided in advance so you have time to review and compare it with your earlier Loan Estimate before signing.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
06bb2e78-d58b-474f-ba77-c047a6824909	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What should I review carefully on my Closing Disclosure before I sign my mortgage documents?	Check your interest rate, monthly payment, cash to close, closing costs, prepaids, and whether any credits or seller contributions match your purchase agreement and expectations.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
65ec8fd1-155a-4d70-b077-573c89a3d30e	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How much money do I need to bring to closing, and when will I know the final amount?	Your Closing Disclosure and settlement statement show the exact cash to close, including down payment and costs; your closing agent or lender will confirm the final figure before signing day.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
261367ad-2286-493d-ae06-bb63753270ed	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Can I use a personal check, or do I need a wire or cashier's check for my closing funds?	Most closings require certified funds, such as a wire transfer or cashier's check, because personal checks can delay funding or be subject to holds by the bank.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
3f2e49f0-5b6c-405c-b25d-4b9edbc9ebc8	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What documents will I sign at closing for my mortgage and the property transfer?	Typical documents include the promissory note, mortgage or deed of trust, Closing Disclosure, affidavits, and title or deed paperwork that transfers ownership into your name.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
111d5a39-9262-4cd7-abad-0b5340390307	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Who typically attends the closing—lender, escrow officer, real estate agents, buyers, and sellers?	Depending on your state and closing type, you may meet with an escrow or title officer, notary, possibly your agent, and sometimes the seller; lenders often prepare documents but do not always attend in person.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
7ed46785-00d0-46ef-bcb3-312b8a8dfbe7	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What happens if my income, credit, or debt changes right before closing day?	Significant changes can trigger a new review and, in some cases, alter or delay your approval, so you should notify your lender immediately if anything major changes before closing.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
78eb9b56-b467-4b7d-9e2c-44963c07868a	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Can the lender re-verify my employment or recheck my credit again just before closing?	Yes, many lenders perform a final employment verification and may check for new credit or debts shortly before funding to confirm nothing has changed that would affect your qualification.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
3803b681-5817-4a05-86be-ccf791643751	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What could cause my closing to be delayed or rescheduled at the last minute?	Common causes include missing documents, unresolved conditions, wire or banking issues, title or insurance problems, appraisal questions, or last-minute changes to terms that require updated disclosures or approvals.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
798f7285-03ab-4c48-8d8d-63f08cd925b2	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How can title issues or last-minute appraisal questions impact my closing timeline?	Unresolved liens, ownership disputes, or value concerns may require additional documentation, corrections, or reconsideration, and closing cannot occur until the title and value meet the lender's requirements.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
fad3b7c6-4270-44c0-a42c-4f812c223763	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	When do property taxes, homeowner's insurance, and mortgage insurance start being collected with my payment?	Initial amounts are often collected at closing to fund your escrow account, and ongoing escrows are then included in your monthly mortgage payment beginning with your first scheduled payment.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
c62cc4cf-7463-4218-bfd0-63452b7fadda	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is the role of the escrow or settlement agent in the closing process for my mortgage?	The escrow or settlement agent coordinates documents, collects and disburses funds, ensures all conditions are met, and handles recording of the deed and mortgage with the appropriate authorities.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
03200544-ce8a-4544-b6b8-966b6a758f65	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	When will my first mortgage payment be due after closing, and how is that date determined?	Your first payment is usually due on the first of the second month after closing, because mortgage interest is paid in arrears and some interest is collected for the closing month at the signing.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
8c1e5351-9b3d-4673-86e8-11f49798caf1	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What should I avoid doing financially in the days leading up to my closing appointment?	Avoid opening new credit, making large purchases, moving large sums without documentation, or missing any payments, as these can prompt additional questions or affect your final approval.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
f9b91cb9-fc2d-43db-bd77-c7678c2a1e8a	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	After closing, will my mortgage stay with the same lender or be sold to another company to service?	Many loans are sold or the servicing is transferred after closing; if that happens, you will receive written notice explaining where to send payments and how to manage your account going forward.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
66fc46bc-bb6c-4e88-8979-eb79270cd265	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What should I do if I find an error on my closing documents on the day of signing?	Pause and alert your closing agent and lender immediately so they can correct and re-issue any affected documents; do not sign paperwork you believe is inaccurate or incomplete.	process	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
004f8450-e0f9-49a3-9935-6a6590e7da6e	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What are the main steps of the mortgage application process from start to finish?	The core steps are pre-approval, formal application, documentation review, underwriting, appraisal, final approval (clear-to-close), signing closing documents, and funding of the loan.	application	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
4c3c8480-166a-4d7b-87c0-c3f85984bbd3	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	When should I apply for a mortgage—before or after I start shopping for homes?	It is best to get pre-approved before home shopping so you know your price range and can submit stronger offers backed by a lender letter.	application	2026-02-03 09:51:37.806	2026-02-03 09:51:37.806
262ac31e-d608-47f0-b47d-8ee5c60782c4	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What information and documents do I need to complete a mortgage application?	Most borrowers provide identification, income documents, tax returns, bank statements, details on assets and debts, and information about the property being purchased or refinanced.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
8bad84c9-65ac-4bab-b1bc-d421c53faece	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How long does it typically take to get a mortgage application approved and closed?	Many loans close in about 30 to 45 days from a complete application, though timing depends on how quickly documents, appraisal, and title work are completed.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
78e30275-ad87-405e-851c-d1f23b9b5c0c	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is the difference between pre-qualification, pre-approval, and full loan approval?	Pre-qualification is an informal estimate, pre-approval includes a credit check and document review, and full approval happens after underwriting, appraisal, and final conditions are satisfied.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
ed7e86dd-9177-41b3-985b-325d9201e727	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	At what point does the lender pull my credit, and will they check it again before closing?	Credit is usually pulled at pre-approval or application, and many lenders perform a final check or monitoring before closing to confirm no major new debts or issues have appeared.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
68ad84a7-bf03-448a-ab87-088ac186730f	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What happens after I submit my mortgage application and upload my documents online?	Your file typically moves to processing, where your information is organized and verified, then to underwriting, where an underwriter reviews credit, income, assets, and the property to decide on approval conditions.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
c91b648d-4b9c-4663-ab9b-2941fd146de8	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is mortgage underwriting, and what does an underwriter actually review?	Underwriting is the lender's risk review; the underwriter examines your credit, income, assets, debts, employment, and appraisal to ensure the loan meets program guidelines and the lender's standards.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
42444d8d-c492-42c8-b716-1db1500007a5	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What are "conditions" in underwriting, and how do I clear them to move forward?	Conditions are items the underwriter needs before final approval, such as updated documents or explanations; once you provide and the lender accepts them, your file can move to clear-to-close status.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
4ab5ce07-a128-4e38-ac8d-4e877c417a54	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How do appraisals fit into the loan process, and what if the appraisal comes in low?	The appraisal confirms the property's value for the lender; if it is low, you may renegotiate the price, increase your down payment, challenge the appraisal, or cancel based on your contract terms.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
2b1f3ae2-6efb-42d1-90d5-28f2906d2adf	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	When do I receive a Loan Estimate, and what should I look for on it?	You should receive a Loan Estimate within a few business days of your application, outlining your projected rate, payment, and closing costs so you can compare offers and understand key terms early.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
18f4bc53-c9bb-464c-aff1-edf7f5ef70ef	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is a Closing Disclosure, and when will I receive it before signing my loan?	The Closing Disclosure is a final, detailed summary of your loan terms and costs that must be provided at least three business days before closing so you can review everything before signing.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
25308127-a2c4-4d7f-a2a1-7a80f0bdab23	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How often will I need to update pay stubs, bank statements, or other documents during the process?	Lenders commonly require documents to be current within a set timeframe, so you may be asked for updated pay stubs or statements if your file is in process for several weeks or more.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
9d294bb2-6179-4f76-99e3-6aadd03d27bf	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Can I change jobs, move money, or make large deposits while my mortgage is in process?	Major job changes, transfers between accounts, or large unexplained deposits can require extra documentation or affect approval, so talk with your lender before making any significant changes during the process.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
068f2e28-0a00-48b1-b449-aedbdd89f0f8	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What actions could delay or jeopardize my mortgage approval once I have applied?	New debts, missed payments, big purchases, unverified deposits, or slow responses to document requests can delay or harm your approval, so consistent finances and quick communication are important.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
3495fffa-3a06-4483-9f1d-d3744576ce51	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Who will be my main point of contact during the mortgage application process?	You will typically work with a loan officer and a loan processor, who coordinate with underwriting and keep you updated on needed items and milestones through to closing.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
e34f1ed2-2001-43c1-a63e-9587fa26c814	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How can I track the status of my mortgage application and know what is still outstanding?	Many lenders offer online portals showing tasks and documents, and you can also request status updates from your loan team to see what has been completed and what remains.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
06e58b1d-f6a4-4097-9043-76484136d5b3	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What happens if my income, debt, or credit changes before my loan closes?	Material changes may require re-underwriting your file and could alter your approval or terms, so it is important to alert your lender immediately if your situation changes.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
dbfc9faf-45dc-4d51-815a-5b92d246ec8c	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is a conditional loan approval versus a clear-to-close status?	Conditional approval means the underwriter has approved your loan subject to specific conditions; clear-to-close confirms all conditions are met and your loan is ready for closing and funding.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
5719678b-e217-4b43-ba55-79df8e717b8f	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	On closing day, what should I expect in terms of signing documents and funding my loan?	On closing day you will review and sign final loan and title documents, provide any required funds by wire or cashier's check, and after funding and recording, you become the official owner.	application	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
823a711b-55df-4e79-9afc-a5e54034af89	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What types of mortgage financing options are available for homebuyers?	Common financing options include conventional loans, FHA loans, VA loans, USDA loans, and jumbo loans, each with different down payment, credit, and occupancy requirements.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
163bbf2e-7f4e-4881-9d50-80aae83bbd3b	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How do I decide between a conventional loan, FHA, VA, or other loan program?	The best program depends on your credit, down payment, military status, property location, and long-term goals; your lender can compare monthly payments, fees, and qualification rules for each.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
9dfaaad2-812b-4394-a311-5fc51f9b157f	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is the difference between a fixed-rate and an adjustable-rate mortgage from a financing standpoint?	A fixed-rate mortgage keeps the same interest rate and principal-and-interest payment for the entire term, while an adjustable-rate mortgage starts with a fixed period and then can adjust based on a market index.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
d65277c4-d315-4a93-b4b3-61e92ca4d099	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How do lenders calculate my debt-to-income (DTI) ratio for mortgage approval?	Lenders add up your monthly debts shown on your credit report plus your proposed housing payment, then divide that total by your gross monthly income to determine your DTI percentage.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
3369f006-7fec-42a4-89c8-b842dcf74a6a	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What DTI ratio do most lenders look for when approving a home loan?	Acceptable DTI limits vary by program, but many loans target total DTI at or below the low-40% range, with some allowing higher ratios when there are strong compensating factors.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
0643bebb-dbdd-4a2f-8087-39fd54dd5b25	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How does my employment history and income type affect my financing options?	Stable, documentable income over at least two years in the same line of work is preferred; self-employed or commission income may require additional tax returns and averaging rules to qualify.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
67e1e17b-145d-44ef-9d82-43ca518e559f	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Can I use bonus, overtime, commission, or gig income to qualify for a mortgage?	Yes, if the income is consistent and documented over time; lenders usually average variable income over two years and verify it is likely to continue.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
da806cc2-9405-48d9-8350-0e60c9b7f73c	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is the minimum down payment required for different types of mortgage loans?	Many conventional loans start around 3% down, FHA often requires a minimum of 3.5%, VA and USDA can offer zero-down options for eligible borrowers and properties, and jumbo loans usually require more.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
8cfdad0c-b434-43ef-b0c1-e1abe03f4ef3	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Can gift funds from family be used for my down payment or closing costs, and what documentation is needed?	Most programs allow properly documented gifts from acceptable donors, often requiring a signed gift letter and evidence of the transfer and source of funds according to the loan guidelines.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
f4b3b6e6-31c9-4ff9-b1ce-24a67d50c403	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is the difference between a pre-qualification and a full pre-approval from a financing perspective?	Pre-qualification is an informal estimate based on basic information, while pre-approval includes a credit check and review of documents, giving you a stronger, more reliable approval amount for offers.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
e5726784-c784-433f-9e9e-1660bebb0b55	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How does my choice of loan term, such as 15-year vs. 30-year, affect my payment and total interest cost?	Shorter terms usually have higher monthly payments but lower interest rates and much less total interest over the life of the loan, while longer terms reduce the payment but increase overall interest paid.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
4edf392b-5e2b-495a-ad91-82ccfca255a7	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What are lender fees, and how do they differ from third-party closing costs in my loan estimate?	Lender fees are charges from the mortgage company, such as origination or underwriting, while third-party costs include appraisal, title, escrow, and government fees that are paid to outside providers.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
bf481397-3c4e-43bd-bad6-33d05c50da7e	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is a rate lock, and when should I lock my interest rate during the financing process?	A rate lock is an agreement that secures a specific interest rate for a set period; many buyers lock after their offer is accepted and loan application is submitted so the rate cannot rise during processing.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
7d44d77b-7c2a-4b7c-a7e0-9824f7245efb	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Can I change loan programs or terms after I have already applied or gone under contract?	Changes are often possible but may require a new loan estimate, updated underwriting, or an extension of deadlines, so any switch should be coordinated early with your lender and agent.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
23f5faa0-d6bb-43bb-8266-7137b380a205	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How do points or "buying down the rate" work, and when does it make financial sense?	Points are upfront fees paid to reduce your interest rate; whether it makes sense depends on how much you pay, how much the rate drops, and how long you expect to keep the loan before selling or refinancing.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
495a5147-e7ce-4818-bf66-bcc3cfb89067	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is mortgage insurance, when is it required, and how does it affect my monthly payment?	Mortgage insurance protects the lender when your down payment is below certain thresholds; it adds a monthly or upfront cost but can allow you to buy with less money down than would otherwise be required.	financing	2026-02-03 09:51:37.807	2026-02-03 09:51:37.807
ce1b2295-64cd-477b-9a3c-7fc939be0f31	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Can I finance closing costs into my mortgage, or use lender or seller credits to reduce cash needed at closing?	Some loan programs allow limited financing of costs or the use of seller and lender credits, which can raise your interest rate or purchase price slightly but lower the cash you must bring to closing.	financing	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
b2043453-8ebe-4edf-b7b7-1df49613fe8d	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How does refinancing work, and when might it be a good idea after I purchase a home?	Refinancing replaces your current mortgage with a new one, potentially lowering your rate, changing your term, or accessing equity; it can be helpful when rates drop or your finances improve enough to offset closing costs.	financing	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
53a26e77-51d4-4985-9503-2b6e7659586f	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Are there special financing options for investors, second homes, or multi-unit properties compared to primary residences?	Non-owner-occupied and second-home loans usually have different down payment, reserve, and pricing requirements, and financing for multi-unit properties may consider rental income and additional guidelines.	financing	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
7d2e7c20-e122-4eae-bd6e-a0bd6b9a2f94	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Besides the interest rate, what other factors should I compare when choosing between mortgage offers?	Compare total lender fees, annual percentage rate (APR), mortgage insurance costs, loan term, prepayment rules, and credits or points so you understand the true overall cost of each option.	financing	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
4cf43610-03b4-4a99-9a30-ba8ee5660f5b	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How does my credit score affect my ability to qualify for a mortgage?	Your credit score helps lenders measure how risky it is to lend to you; higher scores generally make it easier to qualify, often with lower interest rates and better terms.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
3a96e8ec-4711-4e4a-81a8-29b817212036	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What minimum credit score do most lenders require for a home loan?	Minimum scores vary by loan type and lender, but many conventional loans require scores in at least the mid-600s, while some government-backed programs may allow lower scores with other strong factors.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
e709b51f-0ab7-407f-9282-989fe8fbd824	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Which credit score do lenders use when I apply for a mortgage?	Lenders typically pull scores from the three major credit bureaus and use a mortgage-specific scoring model, then base your qualification on the "middle" of those three scores.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
1e13c762-02a8-4fe1-85c5-dd4730c80cdd	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Do lenders look at all three credit bureaus for a mortgage application?	Yes, most mortgage lenders request reports and scores from Experian, Equifax, and TransUnion to get a complete view of your credit history and obligations.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
d112e290-c5d0-473a-abaa-3ac657deb6dd	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is my "middle score" and why does it matter for mortgage approval?	The middle score is the one that falls between your highest and lowest of the three bureau scores, and it is usually the key number lenders use for qualifying and pricing your loan.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
fdc6bd86-7c73-4d1c-8751-1b6ed5d4147e	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Will my co-borrower's credit score affect our loan approval and interest rate?	When there are two borrowers, lenders typically use the lower middle score of the two, so a weaker score can impact loan options, pricing, or even eligibility.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
97dcf5eb-c8c1-4973-ac06-4827b51d6783	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How does the length of my credit history impact my mortgage qualification?	A longer, well-managed credit history tends to be viewed more favorably, while very thin or new credit files may require stronger income, assets, or special programs to qualify.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
0596cb6f-39f9-4e45-9ae3-bcc36be32765	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How do late payments, collections, or charge-offs affect getting approved for a mortgage?	Recent serious delinquencies can significantly lower your score and may trigger waiting periods or extra documentation, while older, resolved issues may have less impact if your recent history is strong.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
4c7277ca-e2d4-437b-8d81-803f3e3c111c	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Can I get a mortgage if I have a past bankruptcy, foreclosure, or short sale on my credit?	Many borrowers can qualify again after certain waiting periods and re-establishing good credit, with the length of time depending on the event type and the loan program you use.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
785ff685-e375-4384-b831-3a69c3b46e29	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How long after a bankruptcy or foreclosure do I need to wait before applying for a home loan?	Typical waiting periods range from about two to seven years, depending on whether it was a bankruptcy, foreclosure, or short sale and which loan type you are applying for; your lender can review your specific timeline.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
6a82dd5d-46f0-4f7b-b1d9-9bcf102eb01b	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Does my credit card utilization ratio impact my mortgage approval and rate?	Yes, using a high percentage of your available revolving credit can lower your score, so keeping balances relatively low compared with limits can improve both qualification and potential pricing.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
defb0d7e-647c-4c76-a625-427db5966331	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Should I pay down credit cards or other debts before applying for a mortgage to improve my chances?	Paying down revolving debt can help your score and reduce your debt-to-income ratio, but it is wise to review a plan with your lender first to prioritize which accounts to address.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
3e887fa2-d706-420d-abf4-02a283ea98d1	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Will applying with multiple lenders hurt my credit score while I shop for a mortgage?	Several mortgage inquiries within a short rate-shopping window are often treated as one for scoring purposes, so comparing offers within a limited time usually has a small impact on your score.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
6a07132f-9046-4a6c-9ed5-750479e4db65	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is the difference between a hard inquiry and a soft inquiry in the mortgage process?	A hard inquiry occurs when a lender pulls your credit for an application and can affect your score slightly, while a soft inquiry, such as some pre-approvals or self-checks, does not impact your score.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
520e9367-3d0b-4367-87e0-d8f931e38923	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How long do mortgage inquiries stay on my credit report and do they lower my score the whole time?	Inquiries usually remain visible for about two years, but their effect on your score is typically modest and tends to decrease after the first year as more recent behavior matters more.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
35fe08a3-8bd2-4dad-9003-fd451c738406	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Should I open new credit accounts or finance a car while I am in the middle of a mortgage application?	Opening new credit or taking on new loans during the process can lower your score and raise your debt-to-income ratio, so most lenders advise waiting until after your home purchase closes.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.808
b0a7c691-4fc6-4af9-998b-07c50d3549cc	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Is it a good idea to close old credit cards before or during my loan process to clean up my credit?	Closing long-standing accounts can shorten your average credit history and raise utilization on remaining cards, which may hurt your score, so changes should be discussed with your lender before you act.	credit	2026-02-03 09:51:37.808	2026-02-03 09:51:37.809
253d9a1c-8fde-4fb6-a9eb-2c9d4228fd3a	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How quickly can my credit score improve if I pay down debt or correct errors before applying for a mortgage?	Some score changes may appear within a few weeks of balances updating or corrections posting, while rebuilding from serious issues can take many months; timing varies by your situation and reporting cycles.	credit	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
d03961ab-20ca-4ddb-8fcd-4da61da3c343	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What should I do if I find an error on my credit report before applying for a home loan?	You can dispute inaccuracies directly with the credit bureaus and, when possible, provide supporting documents; share details with your lender as well so they understand what is being corrected.	credit	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
1506d6b4-b24d-46a2-b29b-48d752175b63	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Are there mortgage programs for borrowers with lower credit scores or limited credit history?	Some government-backed and specialty programs are designed for borrowers with less-than-perfect credit or thin files, often balancing credit with income, savings, and other compensating strengths.	credit	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
afa39089-0971-46e7-81c8-4b350fd5db55	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is a mortgage?	A mortgage is a loan used to buy real estate, where the property itself is collateral for the loan.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
882837f4-8964-4a0d-ab00-deaf466e03c2	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How does a mortgage work?	You borrow money from a lender, repay it over time with interest, and the lender can take the property if you don't repay as agreed.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
bf4c9b1b-0ed1-4402-bf7b-de457769d35a	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What types of mortgage loans are available?	Common types include fixed-rate, adjustable-rate (ARM), FHA, VA, USDA, and jumbo loans.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
d11988e3-5a55-486a-be34-26ba66ddc977	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is the difference between a fixed-rate and an adjustable-rate mortgage?	Fixed-rate mortgages keep the same interest rate for the entire loan term, while adjustable rates can change over time.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
dc88ab22-3bad-41a0-8d54-c2cbf254c85f	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How do I qualify for a mortgage?	Lenders look at your credit score, income, debt, employment, and down payment to determine if you qualify.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
6b4698aa-d243-4d2b-ad05-08728c944b93	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is mortgage pre-approval?	Pre-approval means a lender has reviewed your finances and can offer you a specific loan amount, giving you a stronger buying position.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
ab2c6946-6b52-4327-8d3f-38b344a1404e	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How is my mortgage payment calculated?	Payments include loan principal, interest, property taxes, homeowner's insurance, and possibly mortgage insurance.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
dd9a0540-5291-4ea3-85e9-d2fc8d6e702e	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is included in my monthly mortgage payment?	Principal, interest, taxes, and insurance (PITI)—and sometimes PMI.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
50aac614-cc59-4ea7-bad8-f5297db4a4a5	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is private mortgage insurance (PMI)?	PMI protects the lender if you default and is usually required if your down payment is less than 20%.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
12fcd33b-6397-4208-927c-9ac69779b610	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How can I avoid paying PMI?	Make a down payment of at least 20%, or explore lender-paid PMI or piggyback loan options.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
272aa415-5bc6-4a66-8fec-1940f230df87	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What are closing costs and who pays them?	Closing costs include lender, title, and government fees (2-5% of price), and both buyer and seller may pay certain costs as negotiated.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
32def481-ec60-4a8d-a110-033ab5ab7877	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is an escrow account in relation to my mortgage?	An escrow account holds funds for property taxes and insurance to ensure they're paid on time.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
a124b7de-f7c7-4b5a-986c-d31970c2de13	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How do interest rates affect my mortgage?	Higher rates increase your monthly payment and the total cost of your loan. Lower rates do the opposite.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
dd8f53b3-7ccd-4744-80a5-e094fe406746	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Can I get a mortgage with less than perfect credit?	Yes, but you may pay a higher interest rate or need a larger down payment. Some programs serve buyers with lower credit scores.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
b0ec89c4-d6fc-42d4-9c0b-dd55d160c993	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What are points, and should I pay them?	Points are upfront payments to lower your interest rate. If you'll keep your loan long enough, paying points can save money.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
d922bd62-7fdc-4b96-8f4e-7a3f22be2314	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What documents are required to apply for a mortgage?	Typically, you'll need pay stubs, W-2s, tax returns, bank statements, and ID. Self-employed borrowers may need more paperwork.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
69aa8e2f-fb58-4bd9-89a0-08d6468352fc	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How long does it take to get approved for a mortgage?	30-45 days is common, but it varies. Getting your documents ready early can help speed things up.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
482ae7d2-8cb8-4a4a-9b91-25fbc52629c0	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Can I pay off my mortgage early?	Yes, in most cases. Check if your loan has a prepayment penalty. Paying early reduces your interest costs.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
a9bd013a-04ed-4dce-b2d5-d78573d60c3d	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What happens if I miss a mortgage payment?	You'll likely owe a late fee and risk damage to your credit score. Multiple missed payments can lead to foreclosure.	mortgage-basics	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
d1aea896-10b8-40c0-af82-8bc4c56c23b1	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What is the first step to buying my first home?	The first step is to review your budget and credit, then speak with a lender to get pre-approved so you know your price range and loan options.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
d5ff5477-0071-40bc-89f2-93edaf88ae4f	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How much should I save for a down payment as a first-time buyer?	Many first-time buyers put between 3% and 5% down, though saving more can lower your payment and may reduce or remove mortgage insurance.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
97ca918e-d5a6-4599-a196-e83f94513322	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Are there special first-time homebuyer programs or down payment assistance options?	Many lenders, local governments, and housing agencies offer first-time buyer grants, forgivable loans, or reduced down payment programs based on income, location, or profession.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
8ce1dded-b33e-4d3e-b81c-cb73b62857db	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What credit score do I need to buy my first home?	Minimum credit score requirements vary by loan type, but many first-time buyer programs start around the mid-600s, with stronger scores qualifying for better rates and terms.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
023d40b8-dc93-439b-8532-72ca6240c51d	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How long should I be at my job before applying as a first-time buyer?	Lenders typically like to see a two-year work history in the same field, though recent graduates or job changes within the same industry can often be acceptable with documentation.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
0fc8f618-9603-48fd-8e2f-4fbd6167db9e	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How is buying my first home different from renting?	Buying usually involves upfront costs, maintenance responsibilities, and a longer commitment, but it also builds equity and can offer more stability and potential tax benefits than renting.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
48e7037d-7657-45f1-99d5-3baadfb774e1	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How do I choose the right lender as a first-time buyer?	Compare interest rates, fees, loan programs, and reviews, and look for a lender experienced with first-time buyers who can clearly explain your options and closing costs.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
46fe6c4b-6301-459c-8186-823fad72a3e9	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How do I know what price range is realistic for my first home?	Your pre-approval, monthly budget, and comfort level with payments together determine a realistic range; your agent can also show how taxes, HOA dues, and insurance affect affordability.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
b6e7088e-5d16-420b-9c75-4bcee868ad61	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How much should I budget for closing costs on my first home purchase?	Closing costs typically run about 2% to 5% of the purchase price, and may be paid by you, shared with the seller, or partially covered by lender or assistance programs, depending on your contract.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
083f57df-e94e-4344-b676-234fc0e7be63	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What monthly payment should I be comfortable with as a first-time buyer?	A common guideline is that your total housing payment fits comfortably within your budget after other debts and savings goals, often keeping your debt-to-income ratio within lender limits.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
e8b24395-ebbd-46a7-b348-b4e607dba6b8	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What are the most common mistakes first-time homebuyers make?	Common missteps include skipping pre-approval, stretching the budget too far, waiving important inspections, making big purchases before closing, and not understanding loan terms or closing costs.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
b94d4f80-3a0d-45b8-a857-e7f0add7285f	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How long does the process usually take for a first-time buyer from pre-approval to move-in?	Once pre-approved and under contract, many first-time buyers close in about 30 to 45 days, though searching for the right home can add additional time depending on the market.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
fe87e05c-bccc-421a-8978-b5274bc19081	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Should I buy a "starter" home or wait until I can afford my long-term home?	A starter home can help you build equity sooner, while waiting may allow a larger budget; the best choice depends on your timeline, local prices, and how long you plan to stay in the home.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
8a898a3d-7051-4455-81c6-8e76d9256158	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Is a fixed-rate or adjustable-rate mortgage better for first-time buyers?	Many first-time buyers prefer fixed-rate loans for payment stability, while adjustable-rate mortgages may be useful if you expect to move or refinance before the rate can adjust.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
5a9de291-ed96-44fb-ab21-50ee090e046f	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What inspections are especially important for first-time buyers before closing?	A general home inspection is standard, and depending on the property and location you may also consider roof, sewer, pest, foundation, or environmental inspections for added peace of mind.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
b33ad763-532f-4053-9ff6-f46f7d243826	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	How much should I plan for repairs and maintenance on my first home each year?	A common rule of thumb is to budget around 1% of the home's value per year for maintenance and repairs, though older homes or special features may require more.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.809
ea0b255a-90d3-4f72-ae25-0459e5d9af57	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Can I buy my first home if I have student loans or other debt?	Yes, as long as your total monthly debts, including your future mortgage payment, stay within the lender's debt-to-income guidelines and you meet credit and income requirements.	first-time-buyer	2026-02-03 09:51:37.809	2026-02-03 09:51:37.81
97ebdb08-abeb-4bbe-828e-2f70222aa9e5	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	What happens if the appraisal comes in lower than the price on my first home?	A low appraisal may lead to renegotiating the price, increasing your down payment, changing loan terms, or canceling based on your contract's appraisal contingency.	first-time-buyer	2026-02-03 09:51:37.81	2026-02-03 09:51:37.81
cdfe3303-4761-4d22-af3a-7ed2e7e27117	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Can I ask the seller for credits or help with closing costs as a first-time buyer?	Yes, you can request seller credits toward closing costs in your offer, subject to loan and seller limits, which can reduce the cash you need at closing.	first-time-buyer	2026-02-03 09:51:37.81	2026-02-03 09:51:37.81
7f6e688b-93ee-4115-ac6b-61db01d38572	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Do I need a real estate agent for my first home purchase, and how are they paid?	An agent can guide you through pricing, contracts, and negotiations, and in most markets the seller pays the listing and buyer's agent commissions from the sale proceeds.	first-time-buyer	2026-02-03 09:51:37.81	2026-02-03 09:51:37.81
\.


--
-- Data for Name: officer_content_guides; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.officer_content_guides (id, officer_id, name, category, file_url, file_name, file_type, cloudinary_public_id, created_at, updated_at, funnel_url) FROM stdin;
41328d0a-cc73-4340-8308-b51e0d9d2f6b	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Buyer's Guide	first-time-buyer	https://res.cloudinary.com/dswaqpgfg/raw/upload/v1767711824/officer-content/guides/0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b/BUYER%27S%20GUIDE	BUYER'S GUIDE.pdf	application/pdf	officer-content/guides/0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b/BUYER'S GUIDE	2026-01-06 15:03:45.202	2026-01-06 15:03:45.202	\N
17b0a613-cc76-404a-9a85-ff07b124d0a1	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Credit Score Guide	credit	https://res.cloudinary.com/dswaqpgfg/raw/upload/v1767711826/officer-content/guides/0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b/CREDIT%20SCORE%20GUIDE	CREDIT SCORE GUIDE.pdf	application/pdf	officer-content/guides/0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b/CREDIT SCORE GUIDE	2026-01-06 15:03:47.784	2026-01-06 15:03:47.784	\N
98b4277d-8754-4921-b363-a551df7079c4	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Document Checklist	application	https://res.cloudinary.com/dswaqpgfg/raw/upload/v1767711828/officer-content/guides/0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b/Document%20Checklist	Document Checklist.pdf	application/pdf	officer-content/guides/0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b/Document Checklist	2026-01-06 15:03:48.942	2026-01-06 15:03:48.942	\N
c433d10f-e0fc-4596-8ec3-ca5895b1bc07	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Home Buying Roadmap	first-time-buyer	https://res.cloudinary.com/dswaqpgfg/raw/upload/v1767711829/officer-content/guides/0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b/Home%20Buying%20Roadmap	Home Buying Roadmap.pdf	application/pdf	officer-content/guides/0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b/Home Buying Roadmap	2026-01-06 15:03:50.112	2026-01-06 15:03:50.112	\N
74a4d703-862f-48bd-9d3b-0392bcec6775	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Home Buying Steps	first-time-buyer	https://res.cloudinary.com/dswaqpgfg/raw/upload/v1767711830/officer-content/guides/0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b/Home%20Buying%20Steps	Home Buying Steps.pdf	application/pdf	officer-content/guides/0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b/Home Buying Steps	2026-01-06 15:03:51.71	2026-01-06 15:03:51.71	\N
70949266-ff74-423c-9536-0aec9bfe223f	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Seller's Guide	mortgage-basics	https://res.cloudinary.com/dswaqpgfg/raw/upload/v1767711834/officer-content/guides/0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b/SELLERS%20GUIDE	SELLERS GUIDE.pdf	application/pdf	officer-content/guides/0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b/SELLERS GUIDE	2026-01-06 15:03:54.93	2026-01-06 15:03:54.93	\N
90086f46-d4f0-46f2-ab65-d1040327bcba	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Buyer's Guide	first-time-buyer	https://res.cloudinary.com/dswaqpgfg/raw/upload/v1770112301/officer-content/guides/38b56d65-fe46-4865-aa7c-ae8ba8c72bbf/BUYER%27S%20GUIDE	BUYER'S GUIDE.pdf	application/pdf	officer-content/guides/38b56d65-fe46-4865-aa7c-ae8ba8c72bbf/BUYER'S GUIDE	2026-02-03 09:51:41.58	2026-02-03 09:51:41.58	\N
4e3feda7-f776-497b-8e64-46d4667140e3	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Credit Score Guide	credit	https://res.cloudinary.com/dswaqpgfg/raw/upload/v1770112302/officer-content/guides/38b56d65-fe46-4865-aa7c-ae8ba8c72bbf/CREDIT%20SCORE%20GUIDE	CREDIT SCORE GUIDE.pdf	application/pdf	officer-content/guides/38b56d65-fe46-4865-aa7c-ae8ba8c72bbf/CREDIT SCORE GUIDE	2026-02-03 09:51:43.455	2026-02-03 09:51:43.455	\N
3b86cbb3-4ee6-4537-8f14-c76fb4361f24	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Document Checklist	application	https://res.cloudinary.com/dswaqpgfg/raw/upload/v1770112303/officer-content/guides/38b56d65-fe46-4865-aa7c-ae8ba8c72bbf/Document%20Checklist	Document Checklist.pdf	application/pdf	officer-content/guides/38b56d65-fe46-4865-aa7c-ae8ba8c72bbf/Document Checklist	2026-02-03 09:51:44.431	2026-02-03 09:51:44.431	\N
0ccf4776-a20b-41bc-a7db-97f8ab9a86da	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Home Buying Roadmap	first-time-buyer	https://res.cloudinary.com/dswaqpgfg/raw/upload/v1770112305/officer-content/guides/38b56d65-fe46-4865-aa7c-ae8ba8c72bbf/Home%20Buying%20Roadmap	Home Buying Roadmap.pdf	application/pdf	officer-content/guides/38b56d65-fe46-4865-aa7c-ae8ba8c72bbf/Home Buying Roadmap	2026-02-03 09:51:45.603	2026-02-03 09:51:45.603	\N
d5eabbf1-85f9-4d6f-b544-8a257a5cc645	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Home Buying Steps	first-time-buyer	https://res.cloudinary.com/dswaqpgfg/raw/upload/v1770112306/officer-content/guides/38b56d65-fe46-4865-aa7c-ae8ba8c72bbf/Home%20Buying%20Steps	Home Buying Steps.pdf	application/pdf	officer-content/guides/38b56d65-fe46-4865-aa7c-ae8ba8c72bbf/Home Buying Steps	2026-02-03 09:51:46.677	2026-02-03 09:51:46.677	\N
7ec3f3f1-aa4e-471b-b702-e08f5819caeb	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Seller's Guide	mortgage-basics	https://res.cloudinary.com/dswaqpgfg/raw/upload/v1770112307/officer-content/guides/38b56d65-fe46-4865-aa7c-ae8ba8c72bbf/SELLERS%20GUIDE	SELLERS GUIDE.pdf	application/pdf	officer-content/guides/38b56d65-fe46-4865-aa7c-ae8ba8c72bbf/SELLERS GUIDE	2026-02-03 09:51:48.31	2026-02-03 09:51:48.31	\N
\.


--
-- Data for Name: officer_content_videos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.officer_content_videos (id, officer_id, title, description, category, video_url, thumbnail_url, duration, cloudinary_public_id, created_at, updated_at) FROM stdin;
ac341bf8-47fc-4b6e-aff6-01593c2516d2	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	Conditional Loan Approval	Understanding conditional loan approval and what it means for your mortgage application.	conventional	https://res.cloudinary.com/dswaqpgfg/video/upload/v1767711839/officer-content/videos/0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b/coybcrbincdexhv2snfu.mp4	https://res.cloudinary.com/dswaqpgfg/video/upload/c_limit,h_720,w_1280/so_1/v1/officer-content/videos/0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b/coybcrbincdexhv2snfu.jpg?_a=BAMAAAeC0	1:08	officer-content/videos/0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b/coybcrbincdexhv2snfu	2026-01-06 15:04:01.743	2026-01-06 15:04:01.743
81ae72cd-8128-49da-abc8-490580b5035e	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	Conditional Loan Approval	Understanding conditional loan approval and what it means for your mortgage application.	conventional	https://res.cloudinary.com/dswaqpgfg/video/upload/v1770112309/officer-content/videos/38b56d65-fe46-4865-aa7c-ae8ba8c72bbf/nwdokgxy8rsfv6hyjeec.mp4	https://res.cloudinary.com/dswaqpgfg/video/upload/c_limit,h_720,w_1280/so_1/v1/officer-content/videos/38b56d65-fe46-4865-aa7c-ae8ba8c72bbf/nwdokgxy8rsfv6hyjeec.jpg?_a=BAMAAAWO0	1:08	officer-content/videos/38b56d65-fe46-4865-aa7c-ae8ba8c72bbf/nwdokgxy8rsfv6hyjeec	2026-02-03 09:51:51.69	2026-02-03 09:51:51.69
\.


--
-- Data for Name: page_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.page_settings (id, company_id, officer_id, template_id, template, settings, is_published, published_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: page_settings_versions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.page_settings_versions (id, page_settings_id, company_id, officer_id, template, settings, version, storage_path, is_auto_generated, created_at) FROM stdin;
\.


--
-- Data for Name: public_link_usage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.public_link_usage (id, link_id, ip_address, user_agent, referrer, accessed_at) FROM stdin;
f21391ea-d9b7-46f7-b7fb-86d5bedcfc54	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-10-23 13:23:56.68644
9351cc8c-b6a4-4184-9b01-6249035a22a4	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-10-23 13:36:02.187244
433ef080-a281-4b32-b892-f834690e5f17	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-10-23 13:36:57.051831
9de311a0-b540-47a8-afba-fa3a4604c560	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-10-23 13:37:10.425363
ffe6f9e2-d062-4c18-8114-3db7fedc80b1	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-10-23 13:39:27.786088
719da82c-0929-45f4-8285-c9a3207206f4	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-10-23 13:45:45.998444
8d64a1d1-71cf-4516-8924-b808c825e3f0	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-10-23 14:20:43.292329
92f39a79-b9ba-4ba5-8035-3b0041a6e67c	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-10-23 14:20:53.150334
05b0f24f-d1da-4c98-b522-33b98ebd108a	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-10-23 14:27:11.733232
77492db1-54a6-492c-bb80-09e1e03a5adf	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-10-23 14:27:45.726656
f5bfe9e6-2d2f-401a-a319-779e13abd32f	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	139.135.37.26	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-nu.vercel.app/public/profile/11181907-mh3gdnm4	2025-10-23 16:01:38.986645
266514a3-ce98-44ae-b845-63c6ce70b2ab	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.103.82	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-10-31 13:22:30.98711
6be8acdd-ab1a-402b-8902-d865893aa034	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.103.82	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-10-31 13:23:34.1412
e682fade-1ab4-4e0d-99fb-9f95322e801b	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	74.125.210.11	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36 (compatible; Google-Read-Aloud; +https://support.google.com/webmasters/answer/1061943)	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-10-31 13:23:39.898682
ae706470-400a-48f0-b417-a29aac0f1279	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.103.82	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-10-31 15:40:41.991039
467c6f7e-04b7-4065-bd16-304d5a5625e7	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.103.82	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-10-31 15:40:45.46087
66499ec4-9919-4273-b943-470a55e99860	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	14.1.105.142	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-01 16:31:30.681613
e07c57da-93f1-4e5d-a7c5-6ea13dcf64e1	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.101.72	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-03 10:12:07.220268
c7132e1a-4b27-4abe-84fb-7f6e8e72cca7	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.103.82	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-04 11:01:53.520029
c90baedd-feb4-4b4a-aff5-5efb774205b7	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.103.82	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-04 11:24:01.358371
71f592c7-090e-4b9f-96c4-4a9055652468	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.103.82	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-04 11:41:14.538191
1e805302-f989-404e-9152-cb729e3342bb	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.103.82	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-04 11:43:07.834085
c6b48bf0-c8f6-4141-8dda-bdaaf5e570d5	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.103.82	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-04 12:25:43.783746
f5fbdcf4-a5fa-4392-a1b3-7f10a8f7842f	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.103.82	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-04 12:26:36.360856
3b063384-7bf1-47e1-9f61-1a10b1edb10e	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.103.82	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-04 13:04:59.391478
ab8c440c-7492-465a-81f7-94618885889a	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.103.82	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-04 13:20:27.827823
b3e3e581-f78e-44f4-b86e-2f9fe5d0636d	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.103.82	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-04 14:37:59.839718
3f02e2d9-4c93-4cc6-aafb-81b0ff8c1d44	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-04 14:41:58.999829
24ec5098-21b3-4c0b-9a52-5526d4784294	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.103.82	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-04 14:59:10.676869
5c437ac5-382e-43f3-bf98-b50ef8bcdf32	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-04 15:05:57.439662
23e2c748-4cb5-4df6-a8eb-2f0497f80615	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-04 15:06:02.266105
6c1a3778-6222-4dee-b58f-26c2c056bd57	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 18:49:04.751217
ed70485f-c53c-4a17-bfd2-489bd7dd2710	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 19:23:32.870038
c2d702a1-c16d-43d6-baa9-b00f48888060	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-04 15:06:28.804046
8b14e27b-9fd5-4faf-982d-32a0cf3a1802	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-05 16:56:26.610658
8d97a23c-12d1-4f24-9a43-9ecabb273826	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-05 17:29:33.687977
956817c4-66d3-4ec0-ba23-bf860e5f5c6b	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-05 17:36:48.557133
a454351d-4560-4f49-9755-160dfc15d00c	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-05 17:59:01.31338
c637c0de-6978-47b4-9461-fb20c3149f36	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::ffff:192.168.100.3	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	http://192.168.100.4:3000/public/profile/11181907-mh3gdnm4	2025-11-05 18:00:48.485838
f57a301e-6508-498b-ad00-74a1c0f51357	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::ffff:192.168.100.3	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	http://192.168.100.4:3000/public/profile/11181907-mh3gdnm4	2025-11-05 18:14:13.48172
0c312732-46cc-4a7f-afa0-1ca22347285e	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-05 18:34:10.743536
b1c4a5a2-e02b-4bfa-9c3e-bab251ea8f63	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::ffff:192.168.100.3	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	http://192.168.100.4:3000/public/profile/11181907-mh3gdnm4	2025-11-05 18:37:34.478656
46a4e150-5a7f-411b-b46d-2e625c755ab3	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::ffff:192.168.100.3	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	http://192.168.100.4:3000/public/profile/11181907-mh3gdnm4	2025-11-05 19:01:00.88481
1ade6444-0c15-4323-b5dd-9fb32c3fca73	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::ffff:192.168.100.3	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	http://192.168.100.4:3000/public/profile/11181907-mh3gdnm4	2025-11-05 19:26:45.034129
71cdfbef-1217-4a31-abd7-86e4e788ff7c	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-05 19:41:47.294964
5fc6a219-062f-4227-8cc3-8d04cece497e	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::ffff:192.168.100.3	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	http://192.168.100.4:3000/public/profile/11181907-mh3gdnm4	2025-11-05 19:44:07.872908
54abed02-9a99-444c-aa6e-31b28e664c59	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-05 20:07:14.279926
945698ae-e4b1-478c-8a35-313928f4a7ce	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-05 20:24:46.783194
dcc72857-8ff5-4e62-ad37-78e34330ce65	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-05 20:55:06.065968
d6b7a1e9-4210-4b72-844d-1fdd20ed16e6	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-05 21:14:31.384189
2959c162-2b4f-4e3c-bb7e-0d05df3c8549	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-05 21:35:28.294997
1d0e5f5b-ef8e-4785-b461-d245d8df024e	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-05 22:31:55.776947
faf8bbaf-bd7a-43f5-b3f0-c99b725c6859	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 13:10:03.112942
7a2279da-9a5b-4bb2-9110-c70b8e5c8f39	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 13:38:52.467349
32361652-239a-40cc-8f60-c98f8bc4962a	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 13:52:10.650001
63892842-b04d-4508-b877-a032d56e09e9	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:01:24.580691
cfb6a591-5615-4b85-bf87-99cdf1ad4acc	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:02:36.477214
8d831ce6-43c4-4c67-84cf-74d043213e49	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:12:09.292951
91871e20-69c7-40d4-8801-01c66a1ca574	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:12:10.735743
cff99966-8962-4c7a-bf31-88a13a146ba5	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:13:00.732945
6cc5df8b-bb94-4c23-b4b5-f43c23415bd2	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:14:27.97039
50c9847f-07e1-43f9-8784-8bd8d4190cab	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:21:00.916419
869f9f7a-ef6b-4f40-a92a-fd7111ed2e34	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:21:04.845796
891ebcb2-ac3d-497e-b6e6-58d450324702	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:21:37.676197
c715b0a8-fda9-4f30-8869-60cc7ebbf5e7	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:21:39.238197
ed806ca2-0c60-46d2-91c1-b26c65253bdd	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:30:38.948602
356af5c9-1ebb-4356-a154-a62385d42a86	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:30:55.32339
2c8e79a3-aad1-49a7-9075-d75802ab4f4e	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:34:00.540473
9dd04dfb-4658-4c08-b22e-ab90c987f932	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:34:09.799083
c9d358cd-08d8-4094-99cf-0ff6d8b6c3dc	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:34:42.238355
7b0527d4-0bfa-42d4-8f42-f5ddadc3e51a	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:34:49.931373
31acb19f-cee9-4197-a13a-46dbdc283ff2	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:35:23.752238
43b6cab2-114a-498f-a0e6-f62f8c9dd830	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:35:33.186271
4e1501be-490a-40d9-8f3c-5a8169223c8a	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:36:04.09186
a179478b-1752-45de-b8ee-88e8e8cfe686	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:36:09.229842
a8932a79-fe34-4b6a-8612-ea0e3454c029	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:47:33.46779
353a50db-add4-4bdc-a4cb-d2801b3ebcfc	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 15:49:34.761255
e8dc03ba-4c19-4973-af63-988c1976296f	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 16:17:53.249438
6099a8fc-d0ce-4be5-88e5-57ed8b9d5c84	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-06 16:23:00.709271
8fda8890-ab38-400b-808a-84efadbc96de	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	73.189.190.74	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-26 20:20:43.391302
aaa25d0c-d0bc-41b0-bb24-609c798894dc	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-07 07:05:23.577315
d231c586-e975-4d59-aa78-a780b4669461	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-07 07:07:37.572726
bf776fe8-7fad-46f3-9352-3a3195777e47	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-07 07:11:55.707351
686c2a5a-da5a-4f85-bdd2-2d862f15d4d1	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	174.227.160.242	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-27 02:09:28.080983
98f14a52-5463-43fd-8ef2-2ee6019d21d9	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-07 12:59:39.261333
5094be64-f735-494a-8812-a7fd68c63f90	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:192.168.100.10	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	http://192.168.100.17:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 13:40:11.889962
b77b19a0-dda0-4178-92c4-59a01bbc870a	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.129.218	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-27 09:47:56.962236
a2009dd7-704c-4dd5-ac7c-44f41f56dbc4	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 13:42:34.690991
d0a70a9a-f703-4423-b435-5b84a2bd8f08	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-09 07:56:36.768728
c4b7b118-43d8-4321-9d91-4c71ac1af040	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 09:06:22.703379
07d5f0c3-d95e-4bf7-aa1b-36ac9127c0fc	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.181.193.90	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-29 00:03:51.424871
67ab1e31-05e4-4d7f-84b6-4d633876560d	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.181.193.90	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-29 00:03:57.483539
44d1267a-5aa0-49dc-b0ac-6edcebf36e6b	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 12:27:33.508222
de28ccd9-2636-4ffd-8130-3e5b4fc25d40	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.45.105.87	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-15 15:02:39.83566
5aa71744-5348-40c2-bd1f-113549219d14	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.129.218	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-02 00:08:20.430963
011fc208-9265-4cb3-bf18-59e746e5e3b5	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-17 19:08:34.908648
569f4572-5968-478b-8a6e-bf00dbf6a0c7	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::ffff:192.168.100.10	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	http://192.168.100.17:3000/public/profile/11181907-mh3gdnm4	2025-11-25 11:58:22.392181
2c56208b-50fc-4768-9cbe-ec85ee710edc	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::ffff:192.168.100.10	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15	http://192.168.100.17:3000/public/profile/11181907-mh3gdnm4	2025-11-25 12:00:26.92281
731fd56e-f1c1-477b-99cb-f2d6c6d1d7ca	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::ffff:192.168.100.14	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	http://192.168.100.17:3000/public/profile/11181907-mh3gdnm4	2025-11-25 12:03:27.098957
42c6edeb-d927-47af-a61f-f3fb8ea4e3ad	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	73.189.190.74	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-26 20:25:30.164624
f9607488-e9c4-4faa-ab61-424fb8574284	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-08 06:28:35.827793
4452e1e9-e7e4-4309-b672-ad26557a47bb	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-08 06:34:43.329586
af9b5f90-f39e-4d64-8989-7ed62fb88dad	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:192.168.100.10	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	http://192.168.100.17:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 13:42:32.489875
41328b29-2c0f-40eb-b049-20232649167b	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.129.218	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-27 09:47:57.166367
7664cc66-fa27-4f50-a560-cbc30e74064f	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	104.28.212.124	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-27 09:51:02.218827
bebf6177-9a70-4375-8c5b-ee52c67967a1	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-09 08:29:54.64023
8eb6cb63-6a47-4576-9d59-bfbe78ed748b	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-09 08:30:55.649401
aba61e13-0b6f-4f2f-aa2b-e8a9efa4a069	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-09 08:31:12.032138
bad209d9-88ae-4dc7-bc46-89d5749f3f16	58c7f336-2f1f-4998-9d02-57c9b5d2466b	14.1.105.142	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 14:44:45.954069
b8ec4f48-586c-4b68-874b-b4b7ea983107	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.181.193.90	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-28 22:35:16.423478
84f4938a-79c0-4661-8809-219ab52ea3c1	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	174.227.147.187	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-29 19:57:27.403621
a87e9696-8d64-4847-872c-97ceb3b6e033	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 12:30:44.016937
0131e810-4c86-4dd7-9af3-0ccb57a7864b	58c7f336-2f1f-4998-9d02-57c9b5d2466b	96.47.57.153	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-15 21:56:22.83143
445df267-f58d-4f74-bdc3-abe6986f6a8f	58c7f336-2f1f-4998-9d02-57c9b5d2466b	223.123.23.96	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-18 12:02:58.450917
767d7625-22ae-43d7-8213-e376df38e891	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 19:43:12.619428
d5be1a95-f861-4344-bedd-99262ab7b3b7	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-21 18:24:11.23091
7c41f26a-6078-4059-a8e7-a6d274644e5b	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 18:21:43.655189
205b0a55-fd72-4db0-882b-d7829cbbe9b4	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 18:23:30.552233
41de2b9c-0ed5-4e30-b8b5-d6da5d54f5ad	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 18:26:46.738262
eb665724-ccf9-4bac-8866-572a19f33378	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 18:27:01.060477
2c063bfb-7c3c-4636-82e0-8e51d9e4a1f0	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:18:12.910055
fb555731-303a-47a5-a0eb-7d531b939d53	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:28:24.339608
c8c30215-376d-42da-b57e-302fb817cd02	58c7f336-2f1f-4998-9d02-57c9b5d2466b	14.1.105.142	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-31 05:16:57.645174
879c87c5-f0ac-403d-bde7-6a524a666d43	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-02 17:01:50.801337
c6f5610b-eeb2-42f8-9b2a-163a1c933e64	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-03 08:45:14.962494
ac2dab01-36a1-47bf-bb0d-edb6d0da3c22	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:192.168.100.10	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	http://192.168.100.3:3000/public/profile/0b4cb424-mk2q0np8	2026-02-03 12:07:14.210275
ac3e235f-3de7-46da-a005-b2905b2bd1db	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-04 12:26:32.396115
7d14e853-d5a0-4986-a283-5866ded902b7	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.188.110.246, 64.252.69.102	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-05 13:32:59.953947
4d0c9513-8fbe-4d29-bb9a-6c02a18c9688	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	73.189.190.74	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-27 00:56:49.40034
c0e9e101-758b-4ea9-a1fe-061c1bbac830	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.129.218	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-27 08:23:06.548086
408657f0-8b22-4790-8263-0f37b7f192d4	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-08 07:26:43.250071
bbc3e640-585b-4bc2-88d1-f2fd6686691e	58c7f336-2f1f-4998-9d02-57c9b5d2466b	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-08 07:27:44.948778
7e563db6-75b8-436b-812a-87b9961f4183	58c7f336-2f1f-4998-9d02-57c9b5d2466b	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-08 07:28:07.275212
2cd42fa1-df23-477d-96f6-6f7c9730e4cf	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 14:06:56.72188
bad934c1-616f-4fc2-974b-3ec0a3ee0f9f	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-09 09:45:31.736895
abebe0a4-531d-4c27-8d7e-ae8ac70f38b0	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-12 15:57:14.179282
124fb2a4-b37e-482f-8aa2-1d34fe2b9816	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.181.193.90	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-28 23:08:06.206401
477757ba-4107-40de-bb87-9c725bd16466	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.181.193.90	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-28 23:20:35.368903
c9170542-842f-423f-9e62-8ccc03721825	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.181.193.90	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-29 19:57:48.750698
7341cf04-a017-447d-95cc-6a6249d87d3c	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-12 15:57:19.621141
ce509fa0-d347-4488-bb5e-da17895fefaf	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.129.218	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-01 19:04:05.836032
d52d1d6a-3992-4841-8a8e-2de7ef9bbbd7	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.129.218	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-01 19:04:13.201636
d1850050-3248-46e4-9258-bd1693ffd6ea	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 12:45:46.78557
8cf9f531-a1fb-4d94-83fa-6a9a984820f8	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-16 05:09:36.395633
8f4fce68-9b6a-414e-aaca-cba0ea2d764a	58c7f336-2f1f-4998-9d02-57c9b5d2466b	223.123.23.96	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-18 12:19:53.904521
9e31e5eb-30be-44c8-9e64-5a34459ca010	58c7f336-2f1f-4998-9d02-57c9b5d2466b	66.249.83.129	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36 (compatible; Google-Read-Aloud; +https://support.google.com/webmasters/answer/1061943)	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-18 12:19:56.252901
04d25cdf-b027-4e63-9da2-86f75a670b19	58c7f336-2f1f-4998-9d02-57c9b5d2466b	119.153.111.196	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-18 12:20:00.661398
bd253bfc-c7c3-4ac4-888c-9b7ff129234b	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 19:43:39.95842
0abb7844-dd26-46f1-80a8-a28dbcd8f55d	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-21 18:54:48.103268
d0ef7041-e340-4bfe-9465-828a62d71bf6	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 18:27:02.833723
b7cdc461-11b2-4416-b9c3-5dfc08cc3fa7	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:19:18.666668
0eac552c-1e0c-4b90-9ba8-5cdaf420f1ff	58c7f336-2f1f-4998-9d02-57c9b5d2466b	14.1.105.142	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-31 05:18:32.868823
fe2242f3-5220-4f46-be9c-c50d125ed94d	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 18:52:03.756137
d27826ad-33be-487f-a73f-f185f3a1e382	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-18 12:23:54.462221
8f77fe3a-b9f6-4a2f-8a9a-6669606bd4f6	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-18 12:43:10.728311
30642eb6-f09f-4b27-9fc4-13ac43c6f6c2	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-18 12:49:30.88432
339c4105-9737-4a03-aede-1e6db49cfede	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 19:31:15.725959
50012bb6-745b-4887-a23a-9827e56c17bc	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-21 19:44:16.106797
3d47fa5b-b8a4-47f8-8673-6dcc43c61ab1	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-21 19:48:51.526959
64dc5f0d-8a47-43ee-8cb3-45f33bc45b5b	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-21 19:52:13.182514
6ae632f9-43da-4052-b4a5-838c42a59ebd	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/11181907-mh3gdnm4	2025-11-21 19:52:41.713666
6b92af9a-6d8e-45ae-870a-c4e8a75c1f50	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.107.91	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-21 20:11:03.188851
495e5cf8-ba45-465e-84f9-ab561e66446d	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.101.44	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 10:07:28.863351
db862789-d075-4e0d-ada5-32a534361b21	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.101.44	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 10:11:30.872496
9244a11a-5bd0-450c-a56d-aca881e5f8a0	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.101.44	Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 10:15:23.289794
1b622493-68e2-444b-bb5e-f9a44c7aa6cb	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.129.218	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 16:22:44.256105
407bbe64-6a6d-49b6-bfaa-550e8d23db0a	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.129.218	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 16:22:48.716788
69d2c480-5380-422a-beb4-d81fecbca138	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	73.189.190.74	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 16:30:33.136669
d9ff310f-f4eb-4de9-af02-7a3d98577a14	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.129.218	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 16:34:42.32166
c64045b0-c7af-4d06-9b78-d3fbe7d7e107	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.129.218	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 16:39:17.597517
4c191e0f-4b48-48b8-bb28-82903fd9979f	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.129.218	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 16:42:49.414033
2310bdcf-f85f-491d-a4fa-126e4abd1d84	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.129.218	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 16:42:49.501603
277718f9-db58-466b-ac92-22751c42eddd	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	146.75.154.1	Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 16:45:24.246513
013d7f35-2b5b-4fb9-9709-d75e72b2d06a	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	146.75.154.0	Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 16:52:26.696807
b34b90d4-bdb9-4cb4-8992-f8e94cd2dfa9	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	146.75.154.0	Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 16:52:29.728948
ac31e3c6-22d5-4ddc-8177-01864b28ac77	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	146.75.154.58	Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 16:52:32.013634
0ddaa93d-539f-41d2-95cb-0313147bf887	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	73.189.190.74	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 17:18:50.645735
53d777e7-3682-4cd9-a887-472087d086f6	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	39.45.101.44	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 22:53:51.483239
58823e97-6e8a-4d34-a4b0-30a95b3014a1	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	66.249.93.232	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36 (compatible; Google-Read-Aloud; +https://support.google.com/webmasters/answer/1061943)	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-24 22:53:54.971303
93a6140e-cbfc-404a-b8ce-83b7e9a98736	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	73.189.190.74	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-26 11:44:49.810508
8802a601-568f-43f3-a6ff-77387093c278	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	73.189.190.74	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-11-27 01:33:24.009506
6d1091df-a969-49e3-b4f3-a03784c70d14	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 10:26:46.965963
3e7ec486-d51c-454d-b112-9a1d9e33c7c0	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 14:10:15.488249
14a1c38b-36c1-4eea-ae0e-096e9a4af8c4	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-09 10:07:10.729696
30f899ac-a64d-4c97-a4eb-93f82a42e759	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-12 23:29:19.958587
b0a44b5d-76da-471b-9fb7-d6b34d66b73c	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-12 23:30:07.991504
ff6a7f18-8a08-43bd-9c06-b3f064d05762	58c7f336-2f1f-4998-9d02-57c9b5d2466b	99.83.61.122	Mozilla/5.0 (Linux; Android 16; SM-S928U Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.146 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/537.0.0.52.109;]	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-12 23:30:37.858899
6958f018-7221-430f-8a47-a2438426c5ed	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 12:52:43.371961
3c03db95-7012-4773-ba94-76d05285c8ae	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-21 18:57:57.864991
0fa2bd4a-cc27-4128-ae71-7edb8852d8b7	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-06 15:05:01.257291
493fcfde-5597-4f62-b2c5-28860455a65f	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 10:28:15.912192
fc769147-ed74-466d-9a8c-c2838910a5f8	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.45.102.17	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-08 14:24:23.836359
ceb1332f-d1bb-496d-96f1-ff63e50613ae	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.165.55	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-09 10:44:44.864703
72a53612-0a1c-4e98-8388-6ab7d371d05e	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-12 23:34:11.030252
4769adef-b2f7-4b0a-a25e-64ae86f7bd73	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.129.218	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-03 21:51:30.27901
90b6cfc4-ffd7-43c4-bddb-82ae9bfe121e	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 13:06:26.044606
cb9ce74c-7b75-468f-9e9b-e5f81c2e7400	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 13:06:42.541573
92fc4a38-1ea2-499c-8b35-7d484a1c4dcd	58c7f336-2f1f-4998-9d02-57c9b5d2466b	172.59.130.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-16 20:44:13.223226
048e3be2-3198-4e45-8245-a02f8220025a	58c7f336-2f1f-4998-9d02-57c9b5d2466b	223.123.23.96	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-18 12:36:31.426822
75ce66ba-1deb-45fe-999c-ffe92c39e8f0	58c7f336-2f1f-4998-9d02-57c9b5d2466b	223.123.23.96	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-18 12:43:48.530204
9c3527f6-0b0c-49be-8322-e44f0f5444a1	58c7f336-2f1f-4998-9d02-57c9b5d2466b	172.59.130.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 20:04:29.246911
3bb72b2c-2c30-46b3-8414-8c232cd98ba1	58c7f336-2f1f-4998-9d02-57c9b5d2466b	172.59.130.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 20:04:59.431623
4ff1cfc4-5fdf-4404-b0a4-b04635724aa4	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-22 04:03:42.266885
e799ad4c-4029-41ef-936f-95a34270e16a	58c7f336-2f1f-4998-9d02-57c9b5d2466b	172.225.88.244	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-22 04:04:30.447144
3833f525-2d6c-4726-9029-4136162c34b1	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 18:37:34.31312
16934a79-a60a-4023-9be5-89207e73eb9b	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:21:50.284227
42c93148-57fb-4d44-99cf-89b058f04aa2	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-01 19:29:31.206638
d31903e4-28f1-43c0-ae96-e980aa6c4aae	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v5.vercel.app/public/profile/11181907-mh3gdnm4	2026-02-01 19:33:18.481846
7ecb032d-51a8-4b11-9f63-e2fd184fe4ca	58c7f336-2f1f-4998-9d02-57c9b5d2466b	174.239.170.59	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-02 20:31:39.704122
75d0e298-ff2f-45bb-886b-6eb6976fb222	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-03 09:03:06.518586
2b310ca0-1569-4f40-88c6-a17de4b920ab	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-03 09:03:33.335827
6a568043-c56f-430c-99eb-c55e6e267136	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.163.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-03 12:09:51.864722
495bb54b-5ca4-49ed-b466-935d40d3c4de	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-04 12:34:04.269566
c4c56f83-073f-4847-816f-7ec73cca4f94	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.188.110.246, 64.252.67.162	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-05 13:34:31.638015
07ff59e2-c0f3-47b4-b3bb-a6855d0d69db	58c7f336-2f1f-4998-9d02-57c9b5d2466b	14.1.105.142, 64.252.67.104	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-05 20:23:47.640255
1b935367-c1ff-40b0-9606-9229d13eee7c	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.60.219.116	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v7.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-06 13:40:12.762817
d5107fe1-e6ac-4977-8482-ae77af620606	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.60.219.116, 64.252.67.61	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-06 15:44:23.815926
20162213-ab2a-448b-8a93-fd4d7af633f6	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-06 18:06:01.73708
6894469b-d980-42d5-a5cb-582dc6491ba5	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 19:00:26.106924
9a9b0f94-e931-4179-b17f-4293244c4c04	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 19:40:36.021925
e4e94d20-20cb-424a-88b4-439fe3f8baeb	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-07 12:10:49.626631
3f5df401-beff-4385-84b6-01aa7a7549c7	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-06 15:05:59.088467
e789bb42-55fa-4025-a19c-d7b1763f8690	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 10:41:17.346759
459f0c1f-cf4e-4854-a7c4-d51a1a27dfcf	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-08 17:06:32.828096
a8008de4-5166-4e74-8b87-3321c38de711	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-09 11:11:06.350337
b7f57421-0101-4fea-948d-35996d12cc13	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/537.1.0.47.110;FBBV/846660078;FBDV/iPhone18,2;FBMD/iPhone;FBSN/iOS;FBSV/26.2;FBSS/3;FBCR/;FBID/phone;FBLC/en_US;FBOP/80]	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-12 23:50:07.538723
5e3ca01f-9782-4b98-b62d-d5fdc6a76893	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 13:11:21.72301
aa1ecdee-631f-419a-ae98-5ba651180631	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-16 21:14:10.758668
6fdcd953-9dd4-4cfc-9571-642afd699382	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-16 21:35:21.862475
cbed87e6-22fa-46f6-8e90-2a24c901d8cb	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-18 19:44:27.743181
85388982-48bf-41a8-9528-3e9e0d01151a	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-18 19:44:46.646668
4721a354-56f4-451c-9f08-0351fc18b488	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-18 19:45:11.5231
48df2199-070a-4a46-bc39-42d153f86db7	58c7f336-2f1f-4998-9d02-57c9b5d2466b	172.59.130.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 20:11:56.749787
3c9bd7b3-55f9-4709-848d-62f46735d3cd	58c7f336-2f1f-4998-9d02-57c9b5d2466b	172.59.130.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 20:12:57.822213
7a6833a5-79a6-4835-99aa-47cc60a282cc	58c7f336-2f1f-4998-9d02-57c9b5d2466b	154.80.33.234	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-22 04:38:29.008945
94d2ab7c-0e2e-4020-a82f-06fbf1226f8a	58c7f336-2f1f-4998-9d02-57c9b5d2466b	146.75.136.184	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-22 04:39:10.791277
677cacf0-4464-497c-ac59-361b076e3171	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 18:54:20.919869
247867e9-c7f7-47ed-a5f1-aff01e09b4a6	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 20:26:34.681904
a3114cf1-3f8d-467b-a555-c78250a60a75	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 20:27:21.344619
d16b9db8-d2f3-4d7a-b0d8-f7efd5d9f6dd	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 20:27:55.289518
a49a2f24-dd57-4982-b0d6-f46733537cec	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v5.vercel.app/public/profile/11181907-mh3gdnm4	2026-02-01 19:38:06.133642
041d23fc-ca28-4412-bb7d-1e25d830ff54	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-03 05:13:41.079076
e2bbbf6a-df33-4a29-93a4-50c8753fa940	395b193d-6712-479e-8e19-42abd8fb443e	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/38b56d65-ml6f6jqw	2026-02-03 09:52:29.284815
8442d09c-61f0-4234-a5a4-cba03601285a	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.163.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-03 12:20:48.187614
4fa7eba9-b71a-4290-95a4-b480a4d2d1ef	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.45.102.7	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v7.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-04 13:24:51.808884
d1263130-5730-45c6-bff9-d600b1e58d29	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.188.110.246, 64.252.69.115	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-05 13:36:28.916562
6d790910-7da6-4896-9102-c8836111b312	58c7f336-2f1f-4998-9d02-57c9b5d2466b	14.1.105.142, 64.252.66.14	Mozilla/5.0 (iPhone; CPU iPhone OS 26_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-06 07:49:46.426496
94bbf858-80ff-42e3-9d23-ca26113fc7d2	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.60.219.116, 64.252.68.33	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-06 13:40:46.890363
a5ef52cc-4add-4334-b280-0ab080719eed	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.60.219.116, 64.252.68.110	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-06 16:02:38.180508
46410fb1-2538-4682-b54d-db73fb3f9422	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 18:21:02.43185
93defd6d-772c-42ca-bc19-1b615014717f	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 19:05:21.067261
27db0edb-1677-4ebc-9438-6960b33e9fc4	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 21:13:10.148639
17e86194-fb2d-4a96-b31b-f4bad751a8c8	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-07 12:17:22.705115
217e0332-2e50-46b2-a46b-54d2054ae020	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.165.64, 64.252.67.11	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-07 12:42:23.023753
22571fd3-07e7-477d-8582-798868279ee5	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-07 08:58:54.167122
1060e2c3-9051-4a83-8aa7-11eb534a7be2	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 10:41:23.538346
a5378da5-432c-4178-8a9f-703819621af6	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-08 17:35:39.620996
b2644685-dea2-44ba-bad0-205f51949247	58c7f336-2f1f-4998-9d02-57c9b5d2466b	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-08 17:39:54.441799
d8b7a067-a1ec-4cab-bc4d-8f536af79853	58c7f336-2f1f-4998-9d02-57c9b5d2466b	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-08 17:40:40.870013
a37afc3f-8634-4dc6-8a4e-198820ee9e70	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-08 17:40:45.03194
d6c7ea85-38f1-421f-99f2-1e57cd0f7ed7	58c7f336-2f1f-4998-9d02-57c9b5d2466b	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-08 17:42:25.321785
ca34bc73-69c3-4bca-a520-7d013bdf6e3f	58c7f336-2f1f-4998-9d02-57c9b5d2466b	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-08 17:43:56.482036
ac5e635c-8897-447b-ac4f-e9897e290f14	58c7f336-2f1f-4998-9d02-57c9b5d2466b	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-08 17:50:05.724554
1f8b1379-919e-4e7d-b14d-ebbd966350b4	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 02:30:53.930231
727d988a-8343-42e1-af67-b5d5d5bbfee2	58c7f336-2f1f-4998-9d02-57c9b5d2466b	146.75.154.0	Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 02:31:28.490937
fc078a19-f377-46f5-9e90-a007dde221ed	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	174.227.181.226	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-14 01:25:32.960936
c165988b-01d5-4acf-ac6e-22a712173d0c	58c7f336-2f1f-4998-9d02-57c9b5d2466b	174.227.181.226	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-14 01:29:34.531067
fb53c4f1-8d5f-4e0b-908f-158cf9ca1d91	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 13:44:57.070638
d8c83852-8d19-4d99-8128-f6fa50116286	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-16 21:27:25.840906
8158e748-25b3-4446-8a9f-e765a457987d	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-18 19:45:01.126418
7a9fade8-e02a-49e2-9bb0-e388934ee6cf	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-18 19:45:38.242001
abc7c9a1-ace7-489c-a18b-c64c8fb100fb	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-18 19:47:47.02923
0b0358f5-f851-4842-9c18-e8681819a2df	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-18 19:48:56.466516
1718b9f8-5bd7-4e9f-abf1-27500a73c3c6	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 20:27:35.259878
126c03f8-23d1-4987-806a-f3a0f28e056c	58c7f336-2f1f-4998-9d02-57c9b5d2466b	66.102.9.33	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36 (compatible; Google-Read-Aloud; +https://support.google.com/webmasters/answer/1061943)	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-22 04:38:32.549774
51840b1a-8a09-4c17-9376-ee6cdc5fe5af	58c7f336-2f1f-4998-9d02-57c9b5d2466b	146.75.136.184	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-22 04:39:07.331223
58128d23-fa78-42d9-ba9b-d8b5c8dfcefa	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.181.193.90	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-13 04:15:30.168019
ed32c765-0190-4b86-a6c2-98be700fbd60	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.181.193.90	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-13 04:15:36.023177
de5d5f69-51d1-4163-8252-d8078fbfd74b	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 18:54:20.924887
aa3430bb-d838-4ab3-af6e-42094604f40c	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 20:27:24.863773
61dc371e-b59a-4ab2-91bf-fc1d69444d6f	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-16 06:03:55.394871
522e3909-0e2f-453c-a00a-4b4026077697	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-16 16:24:58.344709
f8b1d176-4bc8-479e-8292-90bce3066a1c	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	174.227.171.185	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-16 18:14:13.658059
71579399-e199-4677-ba14-4a73a9263faa	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	174.227.171.185	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-16 18:22:33.065689
2b977361-ee8c-464e-94e1-a6dd7f839073	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	75.58.124.54	Mozilla/5.0 (iPhone; CPU iPhone OS 26_2_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/143.0.7499.108 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-16 18:23:21.700348
508a8c85-0d31-4823-b01e-f7a9757d82de	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	75.58.124.54	Mozilla/5.0 (iPhone; CPU iPhone OS 26_2_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/143.0.7499.108 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-16 18:51:23.22189
4d652f31-34ca-4122-88a7-bf015b63a262	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	75.58.124.54	Mozilla/5.0 (iPhone; CPU iPhone OS 26_2_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/143.0.7499.108 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-16 18:51:26.910564
0782adac-5192-4883-a7f0-3552593f576d	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	75.58.124.54	Mozilla/5.0 (iPhone; CPU iPhone OS 26_2_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/143.0.7499.108 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-16 18:51:30.842795
7423ef30-e032-4cb8-ac9c-2feec52e5134	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	174.227.171.185	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-16 18:52:50.700659
abf2088f-9515-4cd5-910a-052056c9abcb	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	75.58.124.54	Mozilla/5.0 (iPhone; CPU iPhone OS 26_2_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/143.0.7499.108 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-16 18:55:09.001086
1549d9d4-07d7-418d-8401-180a847ddfc2	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	75.58.124.54	Mozilla/5.0 (iPhone; CPU iPhone OS 26_2_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/143.0.7499.108 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-16 18:55:19.480379
77295700-2fab-4bb1-9d13-2217bb514c8a	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	75.58.124.54	Mozilla/5.0 (iPhone; CPU iPhone OS 26_2_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/143.0.7499.108 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-16 20:39:28.831057
3e30747d-894f-4206-9bcf-4a0210e62e57	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-07 09:39:32.632849
3432039f-460e-4cc9-8b54-eb235f7ab1da	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 10:55:00.421697
d826af69-48e4-4c9d-90de-857ddaa597eb	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-18 05:42:04.125035
e5e59112-4d2e-47b1-ac9b-5b575468ee6d	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:192.168.100.10	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	http://192.168.100.17:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 11:02:36.842293
d29acb3e-0cec-4afd-80de-db86671b3723	58c7f336-2f1f-4998-9d02-57c9b5d2466b	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-08 17:36:38.872303
b5adc153-764a-4a80-ac39-c691aadb8eee	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-18 06:43:55.663872
aa77d7f7-943b-48b0-b5c2-4044c6ebd43a	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 02:36:00.041968
1b3ed8a4-1f86-464e-bfbd-ddb0569e17eb	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 02:37:31.562555
014cd2ad-ce3d-4f9f-9c66-cfefc3f99999	58c7f336-2f1f-4998-9d02-57c9b5d2466b	174.227.181.226	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-14 01:46:26.243615
07071963-23b9-479c-85c4-930b3b6921fe	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 13:51:07.776833
dea3de18-51b0-41b3-99fe-1e3154bcbe6e	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-16 21:41:34.741343
3a4e1a9f-4085-4504-92b2-278fcb615244	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-16 21:42:33.100768
12be8aec-a1ac-42d2-b403-493e514e3a70	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-16 21:44:56.781655
274a995e-5b98-498c-ac87-4a88c81754d5	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-18 20:51:47.706537
76b483ce-dc20-4f8d-968a-efbe0df75e74	58c7f336-2f1f-4998-9d02-57c9b5d2466b	172.59.130.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 20:40:49.570367
b29c11a5-3362-43dd-837a-e73cecee693b	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-22 06:23:52.987741
e22f1f26-406d-4b2a-94e7-99535c9954f1	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 18:58:22.441312
b44f4a3b-0886-4ba4-8969-cf6661254bfa	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:02:11.231285
9e63d98f-d077-409c-b756-c6675d106663	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:02:22.241112
51ff8154-2210-41ed-a538-6f3dc4370c31	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 20:27:57.340667
970c6049-8177-44ad-92c9-52a7878ebad8	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.163.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-02 13:31:50.78751
4ba0d77c-90bb-4662-869a-ce814d7e7d2a	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 18:23:17.184361
0cac548f-e021-44a9-bea1-ff0a9ca32724	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-07 09:44:56.439266
d674d4aa-2cfb-4068-b5b1-d988f0161462	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 11:34:39.814192
32feea44-97a2-4b7c-8019-1bc65ac078d6	58c7f336-2f1f-4998-9d02-57c9b5d2466b	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-08 18:24:12.160329
6645e691-dbbb-4601-aa26-dda206767b22	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 03:36:17.539677
d1ece873-c9cc-4678-b4d8-4c05e6362f85	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 03:36:20.75419
2722df58-ca01-4983-a5bd-e5cf410266b2	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 03:37:01.320241
7936a3ab-b272-47d3-98ac-c4d13bc91db9	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 03:41:57.653518
782adb65-bb2a-4bbd-aa0c-46e941833af2	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-14 11:13:33.558581
5df70a91-8ccf-4c0d-aff3-f1c056a6dedb	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 13:57:50.22388
aee3ddd5-8306-47dc-b690-b73eed734a77	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 13:58:13.744633
3a6525f7-cd79-44b0-bfeb-0aac40020003	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 14:00:17.342624
59d2fc69-e412-4899-ab04-4d2efdfed9bd	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-16 22:16:51.263426
0dde008d-fd9d-49bb-92af-454bd06a793d	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-18 20:59:49.270701
e4c7356c-c835-45f7-9f85-0f6b962601c6	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-20 05:00:52.481731
afe8db48-4968-410a-8144-5b1ab5718c01	58c7f336-2f1f-4998-9d02-57c9b5d2466b	172.59.131.112	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-22 21:04:25.144686
824af675-5caf-417b-bbb8-e15d04f19b05	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:00:32.58039
e7507ad8-3545-48f8-816b-f0f9cc4d3f82	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:01:17.42814
87bf2f7f-91a0-4909-8438-eec314e371e3	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:03:12.723735
7b42e985-1831-4700-b248-e0228caf4bec	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-23 23:02:57.579813
237c47d9-2340-414b-9aad-b643a2770e81	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.163.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-02 13:33:29.657226
67abff02-bf5c-4e2f-b3e7-459eb0451eb0	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-03 05:19:27.837327
f01be7cd-e940-446f-a211-3af7db7d1642	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.163.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-03 10:02:42.830763
3f3cbb22-2a90-496d-83bb-1ee85e6f8e00	58c7f336-2f1f-4998-9d02-57c9b5d2466b	174.239.170.59	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-04 02:17:41.504575
2b77531f-59ce-4182-a14b-bdc5e1511727	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.45.102.7	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v7.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-04 13:53:50.05527
294fb3ef-0c70-4803-a8dd-f5a8a2c05ba1	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-05 19:18:12.230576
2a3265b2-ba84-4647-b9ef-28cb431a7b73	58c7f336-2f1f-4998-9d02-57c9b5d2466b	14.1.105.142, 64.252.66.178	Mozilla/5.0 (iPhone; CPU iPhone OS 26_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-06 11:11:48.663373
525c585a-5f5b-40a0-8238-af4bb29e9a55	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.60.219.116, 64.252.66.101	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-06 14:02:34.035178
2d07ae1d-d44a-4d64-9614-05094a031309	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.60.219.116	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v7.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-06 16:51:13.028177
52702f43-38c8-4ed9-88da-e4143987feb7	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 18:27:35.604304
4e344125-22c1-49bc-86a5-a75e8382837d	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 19:06:30.533863
12474d66-7c61-4f35-9be4-dca12fe16346	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.165.64	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v7.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-07 11:08:07.259721
4db5f385-3202-4ea2-8a49-373924e1fec0	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-07 12:23:56.592937
b237d943-e2db-408c-a221-5ab7c58b7df5	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-07 12:01:44.711974
2d7de391-37dd-4ffa-89db-a45fcf16b6b9	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-07 12:02:32.04156
4632f607-57b0-4275-8631-ed23b2d5ee79	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 12:46:21.223673
02a2f0b3-52ec-4d38-a655-f6124dc2bed2	58c7f336-2f1f-4998-9d02-57c9b5d2466b	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-08 19:04:16.125319
ef511787-3b1a-4a2c-8de5-c004c841bb72	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 03:36:25.541002
e4202add-6ba0-470c-badb-611af6c21b2d	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-10 03:36:44.531323
48912c35-1e0d-4c9c-9a7a-05766b481c4a	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 03:36:54.433682
c35506a5-934b-4bf8-8a7a-0c949cbb0e76	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 03:36:56.253704
6c9eaf8a-6583-466c-8150-9e9932b307a5	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	174.227.181.226	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-14 20:33:08.670944
debfa437-5739-4c25-bce5-a9a154084584	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 14:17:38.669598
2f1acda0-b9ef-4fb7-a246-ae06a7465672	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-17 16:42:10.054415
1f075ad9-2482-4fdb-b3c5-585871269488	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-18 21:25:08.295207
a8c2a8da-582b-464f-a36d-e9577a127794	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	174.227.176.119	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-21 17:45:56.244938
7eb80774-45fe-4c34-a9b2-c7bc124a5243	58c7f336-2f1f-4998-9d02-57c9b5d2466b	172.59.131.112	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-22 21:04:41.842486
5289c7b1-2a18-4dc6-baa4-0f7f4a8c1b5a	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:00:44.967358
15bc49a2-58b2-42a4-b6cb-ab1db1ab3731	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:02:38.00721
7ee20030-2320-4d70-a0b7-03eb6e2b6140	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:02:44.84279
f90d7d78-30e9-4c45-b167-0520c87a026e	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:03:03.109289
91ce13f4-e000-4f8c-93f4-9002730fa8c0	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-23 23:47:58.395401
8d9c4775-310e-4e02-a649-67156643cc55	58c7f336-2f1f-4998-9d02-57c9b5d2466b	107.175.196.99	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-02 14:40:45.412186
4c0663d2-4c6d-43ca-abf2-e6b4991001e6	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-03 06:36:31.696049
276bddbe-d188-4731-b3a0-b19e301ad9a6	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.163.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-03 10:08:06.476181
cdddb5e9-c54b-4cb0-9e86-8abf009daa1b	58c7f336-2f1f-4998-9d02-57c9b5d2466b	174.239.170.59	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-04 03:10:30.683766
426c5407-1a58-4bed-a156-e2534fc5fbf6	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.45.102.7	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v7.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-04 13:55:02.131605
c8896792-5922-48d4-bc96-6347a88b56c6	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.60.219.116, 64.252.68.33	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-05 19:33:21.595801
cf272c1d-35b1-4b3e-92b9-2c7bfa33bc4e	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.60.219.116	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v7.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-06 11:20:40.748629
ffab587a-827c-4f84-9597-9356977ad844	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.60.219.116, 64.252.68.33	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-06 14:09:36.448582
90b80219-2231-4678-a60b-280c648b715e	58c7f336-2f1f-4998-9d02-57c9b5d2466b	223.123.2.105, 64.252.67.11	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-06 17:32:00.286749
a06827d6-7f63-4ecd-a256-bef572292e2f	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 18:31:01.690527
4196b907-c77b-47ac-8b99-257223842fa2	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 19:09:30.337542
ef2830bd-3803-4cba-bf3e-7fc93c7e015f	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-07 11:28:09.95453
0fb889ff-85e7-4623-9cf3-cd51219c3139	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.165.64, 64.252.68.110	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-07 12:33:29.855197
c85deb70-243b-4f2e-a824-965611db26f2	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.165.64, 64.252.67.11	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-07 12:47:38.915797
5a6971e4-ee2d-44b0-951d-19597df72173	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-07 12:39:13.04998
1b2f8b13-a9c8-448b-844c-2936e1dfe366	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 13:12:50.711257
49d9f818-74c1-4936-b300-da86b5f270b3	58c7f336-2f1f-4998-9d02-57c9b5d2466b	66.8.220.79	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-08 19:04:19.808938
3c85085c-454b-45d8-8323-86d9c57edc07	58c7f336-2f1f-4998-9d02-57c9b5d2466b	172.59.128.54	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 07:24:50.105602
b5b6410c-4fb8-480f-8430-655daaf206e9	58c7f336-2f1f-4998-9d02-57c9b5d2466b	172.59.128.54	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 07:24:53.879799
ab64485c-e7e9-4203-8a18-e17d969520d6	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 09:37:53.271557
25c97a02-2ebe-474b-af5a-3b6754f43ffe	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 14:19:37.826847
af630d2e-a3b9-46ca-90ab-e5f986aa9d62	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-17 17:34:57.029921
e1046cd1-661a-4bc6-8486-059502aad74b	58c7f336-2f1f-4998-9d02-57c9b5d2466b	172.59.130.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 19:05:40.798121
76a52bfe-c671-43f5-b766-aa06cb26fee7	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 19:09:30.933711
b2e7ed95-cca9-4123-8aed-e343c8fdb2fa	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 19:12:05.01653
4fbf0db6-0a1a-4dc7-a531-72987e2600d1	58c7f336-2f1f-4998-9d02-57c9b5d2466b	174.227.176.119	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-21 17:47:40.496384
8bd49ec6-64bf-4adc-801d-67c408da3d92	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-22 22:21:30.40884
c80805b5-2d8b-488e-8c9b-4332bb863b7f	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-22 22:22:33.053554
8baf286e-bd34-43a4-8fa2-0ef8915349bc	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-22 22:22:54.308956
cad4d395-0047-4edc-878e-e0296c96a3e2	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-22 22:22:57.453781
b7eeed40-57bd-44a8-83ba-c90a0fe84ba4	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-22 22:22:59.576713
cfd3e645-4821-4228-86a3-4aeea901f56f	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:00:49.594113
ee7e13a2-9553-43be-a555-085d9dba6c03	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:01:06.670193
433a7260-5b04-4d14-aa1e-0fa30a06f542	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:02:30.537902
ef9c5926-eec0-4767-be50-4dd31500f487	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:02:59.225735
e20fad3d-7703-4f80-88d3-ce8077512267	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:03:17.560286
3659777b-6af4-4ed8-af31-897197c7b05e	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-24 13:17:44.713656
4b5c8a12-a5fe-4566-92cc-a6656cac04a7	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.163.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-02 14:40:53.165452
d78c9e27-d2a9-4ff9-b152-e7e425d9ee68	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-03 08:21:38.262374
deabef75-a1bb-4916-a897-d2418d226bde	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.163.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-03 10:09:20.579523
e60b5248-cb3b-4ee5-8862-1169340a90ec	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-04 03:58:17.143908
9d218f04-e930-4048-b8da-5e4a2534af15	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.45.102.7	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://loan-platform-v7.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-04 14:06:28.402181
760f9bb0-279a-4552-9a88-a6293c8f072b	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.45.102.7	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://loan-platform-v7.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-04 14:07:31.546309
93d31f48-822d-429f-a545-4fc12a18b0b0	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.60.219.116, 64.252.68.33	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-05 20:03:28.371925
9e4ba3a5-13d8-49c5-88cc-6ef427640cc2	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.60.219.116	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v7.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-06 13:26:32.207129
f6b12550-e06d-46bc-b541-bd2d91b53e18	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 18:01:39.275544
6f17e06f-c0b2-4d69-bf2c-2dbe950af529	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-07 12:55:59.810658
bc57a009-8a91-4ec6-85c2-b5f4a2121423	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:192.168.100.10	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	http://192.168.100.17:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 13:23:23.739648
494a310c-d494-48ea-b26f-53707720217e	58c7f336-2f1f-4998-9d02-57c9b5d2466b	174.202.5.206	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-08 21:02:00.452613
7a5573c1-be53-4e54-ac83-125f4ca804aa	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	174.202.5.206	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-08 21:02:45.157409
40d3a95f-af1a-44ba-8adf-450f6ddee970	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 08:20:34.884343
c22e9de8-ffd2-40cf-bd5e-1a247fb08eb1	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 10:20:37.659027
c649af08-599a-4168-8507-66882adf68d7	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 14:52:38.790974
e0181227-c39f-423a-a115-d90bddd3e141	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-17 18:04:59.078259
d15e4568-91eb-4343-b64c-ed6609723d30	58c7f336-2f1f-4998-9d02-57c9b5d2466b	172.59.130.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 19:08:41.102387
204d8c52-dc65-42dd-9e35-112f7c7f854b	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 19:10:08.960255
5fbafe39-590c-4353-a641-1ee94ed8290b	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 19:11:30.881003
133b08e2-d089-4b94-bfdd-9861b989d726	58c7f336-2f1f-4998-9d02-57c9b5d2466b	172.59.130.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 19:19:26.560968
cfe6b1d6-9b41-4a9d-b7eb-43c5b72c91da	58c7f336-2f1f-4998-9d02-57c9b5d2466b	174.227.176.119	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-21 17:50:26.505425
a0f41175-9e41-452a-ac9d-af1d64032683	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.131.112	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-23 00:06:05.103409
e2e786ad-1aaf-4a54-aac1-4ca35bd867bc	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.131.112	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-23 00:07:55.389703
de4959e6-bef6-499d-bfe9-7ecccd29b420	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.131.112	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-23 00:10:54.969556
79d854fa-13c6-417f-80e3-6cbb5b626703	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	172.59.131.112	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-23 00:13:11.176235
64fc93e2-9d5e-4968-9b20-ac1760b26024	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:00:54.060689
d6a462e1-efc6-4c79-8a3e-53b839882c1d	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.165.86	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v4.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-28 06:12:59.448732
736589b1-69a2-4d65-b731-c24c0269dd4b	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-02 15:38:49.059088
a59e9965-ae38-43fb-9848-1646cede87ea	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-03 08:35:24.210938
3ec4e737-0b76-49c6-854a-5e09af1885c3	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.163.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-03 10:27:00.801821
ec185a0b-e3cd-46ab-b9d6-94839703156f	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-04 12:23:15.743396
85480684-c3c6-490b-b870-03c6b3e2a5c7	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.45.102.7	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v7.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-04 14:47:41.498874
450fd44f-e34a-4bba-8477-ca509db942de	58c7f336-2f1f-4998-9d02-57c9b5d2466b	14.1.105.142, 64.252.67.11	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-05 20:21:19.744618
8fb19b7b-cdb5-4d7a-b6a5-1642317cbc4d	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.60.219.116	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://loan-platform-v7.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-06 13:28:16.835661
8b8fa447-292c-4046-af52-130195a9e286	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.60.219.116, 64.252.69.135	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-06 14:42:27.133947
03c955d2-1b87-4e53-b57f-f7d40eefe660	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 18:03:48.429432
acfa0761-49b0-4cdf-a669-b8b9a390874e	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 18:33:17.113396
571a180d-ca32-4880-b995-e3fa3fd56324	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 19:14:02.832432
df73cf7b-754d-459e-b3d0-15a9104d83cc	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-07 11:56:35.183952
e78bda4d-82c1-40d3-a062-4e360c8d2a03	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.165.64, 64.252.68.55	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-07 12:39:21.084997
4b53f8f8-a6dd-4750-98a7-bfe1194cbf28	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.165.64, 64.252.66.5	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-07 13:13:05.683183
b55d110e-27eb-4d3d-b099-53edb460b09f	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-07 12:56:22.118079
4059cfa1-8ce2-40c6-8df3-d0632678f1d8	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 13:31:03.124084
1d78789e-aac5-4f3e-900c-ac19e1da0b74	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-31 05:37:18.296857
f85fb547-4b02-4da4-9c05-e6d9f5dc0a25	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-31 06:25:38.630555
da2ef4a0-a484-4f20-bc8c-48c90b5b8095	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-31 06:25:41.08876
70d5f52d-f149-499f-bc09-7369537a7267	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-31 06:25:44.762044
dfdd5a4b-a9c5-4472-bb1e-314b0e7492a7	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2025-12-31 06:26:01.550964
22d7d316-8789-4115-9f55-cb7b66810da4	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-08 13:33:25.514795
503b0b69-1ddb-4922-9f03-48fb11e3f217	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	216.234.201.189	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-09 03:53:39.765292
5a7ad069-43a5-4d3e-84f1-41ab4d17120a	58c7f336-2f1f-4998-9d02-57c9b5d2466b	216.234.201.189	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-09 03:54:55.675264
4dd89f83-7016-43a7-a0a7-f7ea3203e798	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 08:43:56.270692
7d663d64-53a8-4cc1-a684-6d0adec3b364	58c7f336-2f1f-4998-9d02-57c9b5d2466b	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-10 08:44:10.833016
40c94dd6-a7bc-4576-aae6-b2d593ab9793	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 12:13:02.651414
80173d5d-b899-4473-8c88-a5c166ffd914	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-15 14:53:07.16454
4f05f001-1821-4e9d-afc9-c9411342245f	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	174.239.167.155	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-01 00:53:39.089493
b14982b7-9102-4e36-9353-ab86165391b5	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-01 01:46:09.707039
36613501-9cb7-4dea-8889-80b67e2345ae	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-17 18:31:17.111406
967d11d8-4c54-49dc-8998-eb20c46d4d80	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.181.232.138	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-19 19:12:13.990607
c49ce76b-f030-4e36-a896-f29df656d6a6	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-01 14:42:03.571965
58c4e3fe-5bb0-4040-bc33-58c12d939e93	2c0e0aa7-6d9a-4467-92b2-eac9e7a87f75	67.170.254.147	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/11181907-mh3gdnm4	2026-01-01 15:11:59.023752
ac862a8b-0f09-4be6-94fd-514307f52076	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-21 18:22:34.056186
0d53f8f0-cb9e-4852-839b-0a3b8a68d0cd	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-21 18:23:00.185401
2c79ffbf-2ca4-459d-9cdf-1d7d65a077b3	58c7f336-2f1f-4998-9d02-57c9b5d2466b	172.225.89.110	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v3.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-23 04:29:47.053489
76980fdc-8d2d-4d01-bff9-f5e5da93853e	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:01:33.506487
53f8e9b8-6273-4183-bbed-5cc011914bc4	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::ffff:127.0.0.1	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-01-23 19:02:28.072838
bb9d6885-f46d-40b4-9537-bf04f05eec86	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.165.86	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	https://loan-platform-v4.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-01-28 06:14:12.175596
07e6f144-2bdf-4fc7-abec-629a926ed833	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-02 15:44:24.413021
b4414bac-871c-4e2f-bcfa-227ba0b6bcd9	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-03 08:38:44.314734
6ae07cdd-7a8b-42a2-9525-8df96f1028dd	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.163.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-03 11:14:33.114144
15134a00-e1bd-4933-9954-9b61babb5caf	58c7f336-2f1f-4998-9d02-57c9b5d2466b	::1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	http://localhost:3000/public/profile/0b4cb424-mk2q0np8	2026-02-04 12:25:39.599472
624f6b63-e763-408b-9fe3-d95ca05d8991	58c7f336-2f1f-4998-9d02-57c9b5d2466b	182.188.110.246, 64.252.67.38	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-05 12:55:03.587125
81219eb8-ab50-4574-9e8e-23bffabaf93c	58c7f336-2f1f-4998-9d02-57c9b5d2466b	unknown	\N	\N	2026-02-06 18:41:08.393526
928f4357-2839-4fd9-b82d-37f6ba657fd8	58c7f336-2f1f-4998-9d02-57c9b5d2466b	14.1.105.142, 64.252.67.11	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-07 13:58:02.764574
39bf1e58-df2c-498b-a345-0e8e1fbb03c9	58c7f336-2f1f-4998-9d02-57c9b5d2466b	154.80.48.1, 64.252.66.115	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-07 14:02:26.883479
cdee9108-5ccf-45e4-9ded-e527bc5f7296	58c7f336-2f1f-4998-9d02-57c9b5d2466b	154.80.48.1, 64.252.66.247	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-07 14:05:19.002867
f39e61cb-3aa2-4af0-b6b1-bc7d0748a0e3	58c7f336-2f1f-4998-9d02-57c9b5d2466b	174.239.177.28	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-07 20:46:56.458342
edd0deb6-2331-43b8-831a-9d5021fa11f7	58c7f336-2f1f-4998-9d02-57c9b5d2466b	14.1.105.142, 64.252.66.197	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-08 14:55:17.135236
9d813181-bc35-4317-832c-b3ee285d2fab	58c7f336-2f1f-4998-9d02-57c9b5d2466b	14.1.105.142	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	https://loan-platform-v5.vercel.app/public/profile/0b4cb424-mk2q0np8	2026-02-08 14:57:09.456138
f65a9c6d-25bc-4b45-8b72-12683973a1ff	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.166.107, 64.252.66.139	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-08 15:22:45.517229
fe64b889-cd4d-44d4-b49c-78f8ddea18e6	58c7f336-2f1f-4998-9d02-57c9b5d2466b	39.39.166.107, 64.252.68.116	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	https://main.dtnh3ppmcqqg4.amplifyapp.com/public/profile/0b4cb424-mk2q0np8	2026-02-08 15:35:03.809095
\.


--
-- Data for Name: rate_data; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rate_data (id, company_id, loan_type, loan_term, rate, apr, points, fees, monthly_payment, loan_amount, credit_score, ltv, dti, is_active, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: selected_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.selected_rates (id, officer_id, company_id, rate_data, created_at, updated_at) FROM stdin;
476a6c6a-cda6-4dcc-8b96-d669c49136ee	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	{"id": "4", "apr": 5.34, "fees": [{"amount": 0, "prepaid": false, "section": "", "description": "", "paymentType": ""}], "points": 1, "credits": 0, "loanTerm": "30 ", "loanType": "Fixed", "lockTerm": 30, "lastUpdate": "2026-01-08 08:42:05.0", "lenderName": "Chase(273)", "loanAmount": 150000, "lockPeriod": 30, "upfrontFee": 0, "downPayment": 75000, "eligibility": {"comments": "", "eligibilityCheck": "Pass"}, "loanProgram": "Conf 30 Yr Fixed ", "productName": "FNMA 30 Yr Fixed Agency", "interestRate": 5.25, "searchParams": {"loanAmount": 150000, "creditScore": "800+", "downPayment": 75000, "loanPurpose": "Purchase", "purchasePrice": 225000}, "pricingStatus": "Active", "monthlyPayment": 828.31, "monthlyPremium": 0, "originationFee": 0}	2026-01-09 12:26:32.493636	2026-01-09 12:26:32.493636
4ecb9366-757d-4815-8aab-c0840614ee6a	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	{"id": "4", "apr": 5.214, "fees": [{"amount": 0, "prepaid": false, "section": "", "description": "", "paymentType": ""}], "points": 1, "credits": 0, "loanTerm": "30 ", "loanType": "Fixed", "lockTerm": 30, "lastUpdate": "2026-01-14 09:03:49.0", "lenderName": "Chase(273)", "loanAmount": 150000, "lockPeriod": 30, "upfrontFee": 0, "downPayment": 75000, "eligibility": {"comments": "", "eligibilityCheck": "Pass"}, "loanProgram": "Conf 30 Yr Fixed ", "productName": "FNMA 30 Yr Fixed Agency", "interestRate": 5.125, "searchParams": {"loanAmount": 150000, "creditScore": "800+", "downPayment": 75000, "loanPurpose": "Purchase", "purchasePrice": 225000}, "pricingStatus": "Active", "monthlyPayment": 816.73, "monthlyPremium": 0, "originationFee": 0}	2026-01-15 09:52:39.214956	2026-01-15 09:52:39.214956
d672495d-a724-4d8b-a508-cef6f8e63aeb	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	{"id": "4", "apr": 5.214, "fees": [{"amount": 0, "prepaid": false, "section": "", "description": "", "paymentType": ""}], "points": 1, "credits": 0, "loanTerm": "30 ", "loanType": "Fixed", "lockTerm": 30, "lastUpdate": "2026-01-14 09:03:49.0", "lenderName": "Chase(273)", "loanAmount": 140000, "lockPeriod": 30, "upfrontFee": 0, "downPayment": 85000, "eligibility": {"comments": "", "eligibilityCheck": "Pass"}, "loanProgram": "Conf 30 Yr Fixed ", "productName": "FNMA 30 Yr Fixed Agency", "interestRate": 5.125, "searchParams": {"loanAmount": 140000, "creditScore": "800+", "downPayment": 85000, "loanPurpose": "Purchase", "purchasePrice": 225000}, "pricingStatus": "Active", "monthlyPayment": 762.28, "monthlyPremium": 0, "originationFee": 0}	2026-01-15 10:00:54.942831	2026-01-15 10:00:54.942831
7d12c5b3-5960-402d-abff-adf31aee4807	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	{"id": "4", "apr": 5.25, "fees": [{"amount": 0, "prepaid": false, "section": "", "description": "", "paymentType": ""}], "points": 0, "credits": 0, "loanTerm": "30 ", "loanType": "Fixed", "lockTerm": 30, "lastUpdate": "2026-01-14 09:03:49.0", "lenderName": "Chase(273)", "loanAmount": 150000, "lockPeriod": 30, "upfrontFee": 0, "downPayment": 75000, "eligibility": {"comments": "", "eligibilityCheck": "Pass"}, "loanProgram": "Conf 30 Yr Fixed ", "productName": "FNMA 30 Yr Fixed Agency", "interestRate": 5.25, "searchParams": {"loanAmount": 150000, "creditScore": "800+", "downPayment": 75000, "loanPurpose": "Purchase", "purchasePrice": 225000}, "pricingStatus": "Expired", "monthlyPayment": 828.31, "monthlyPremium": 0, "originationFee": 0}	2026-01-15 14:58:01.454503	2026-01-15 14:58:01.454503
a039f714-4429-4b23-8b8f-539e4ff167be	11181907-e372-48c9-8f40-26a675d37a57	8397bc63-e24e-4897-ad56-4d48d6efd130	{"id": "4", "apr": 5.431, "fees": [{"amount": 0, "prepaid": false, "section": "", "description": "", "paymentType": ""}], "points": 2, "credits": 0, "loanTerm": "30 ", "loanType": "Fixed", "lockTerm": 30, "lastUpdate": "2026-01-22 12:52:35.0", "lenderName": "Rocket Corr Plus(3181)", "loanAmount": 475000, "lockPeriod": 30, "upfrontFee": 0, "downPayment": 75000, "eligibility": {"comments": "", "eligibilityCheck": "Pass"}, "loanProgram": "Conf 30 Yr Fixed ", "productName": "FNMA 30 Yr Fixed", "interestRate": 5.25, "searchParams": {"loanAmount": 475000, "creditScore": "800+", "downPayment": 75000, "loanPurpose": "Purchase", "purchasePrice": 550000}, "pricingStatus": "Active", "monthlyPayment": 2622.97, "monthlyPremium": 0, "originationFee": 0}	2026-01-23 00:12:24.889991	2026-01-23 00:12:24.889991
f2b1d641-f349-47b8-994e-13fd3b376556	11181907-e372-48c9-8f40-26a675d37a57	8397bc63-e24e-4897-ad56-4d48d6efd130	{"id": "4", "apr": 5.466, "fees": [{"amount": 0, "prepaid": false, "section": "", "description": "", "paymentType": ""}], "points": 1, "credits": 0, "loanTerm": "30 ", "loanType": "Fixed", "lockTerm": 30, "lastUpdate": "2026-01-22 12:52:35.0", "lenderName": "Rocket Corr Plus(3181)", "loanAmount": 475000, "lockPeriod": 30, "upfrontFee": 0, "downPayment": 75000, "eligibility": {"comments": "", "eligibilityCheck": "Pass"}, "loanProgram": "Conf 30 Yr Fixed ", "productName": "FNMA 30 Yr Fixed", "interestRate": 5.375, "searchParams": {"loanAmount": 475000, "creditScore": "800+", "downPayment": 75000, "loanPurpose": "Purchase", "purchasePrice": 550000}, "pricingStatus": "Active", "monthlyPayment": 2659.86, "monthlyPremium": 0, "originationFee": 0}	2026-01-23 00:12:29.791079	2026-01-23 00:12:29.791079
6bbad166-5a13-4dfb-a4ba-4e71aa0ad0e5	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	{"id": "2", "apr": 5.56, "fees": [{"amount": 0, "prepaid": false, "section": "", "description": "", "paymentType": ""}], "points": 0, "credits": 0, "loanTerm": "15 ", "loanType": "Fixed", "lockTerm": 30, "lastUpdate": "2026-01-27 16:53:02.0", "lenderName": "The Loan Store Broker(10895)", "loanAmount": 225000, "lockPeriod": 30, "upfrontFee": 0, "downPayment": 75000, "eligibility": {"comments": "", "eligibilityCheck": "Pass"}, "loanProgram": "Conf 15 Yr Fixed ", "productName": "Conf 15 Fixed", "interestRate": 5.25, "searchParams": {"loanAmount": 225000, "creditScore": "720-739", "downPayment": 75000, "loanPurpose": "Purchase", "purchasePrice": 300000}, "pricingStatus": "Active", "monthlyPayment": 1808.72, "monthlyPremium": 0, "originationFee": 0}	2026-01-28 06:18:09.009045	2026-01-28 06:18:09.009045
fbe144a3-c247-4e6c-8cb0-5a90a2a3c373	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	{"id": "4", "apr": 5.625, "fees": [{"amount": 0, "prepaid": false, "section": "", "description": "", "paymentType": ""}], "points": 0, "credits": 0, "loanTerm": "30 ", "loanType": "Fixed", "lockTerm": 30, "lastUpdate": "2026-01-30 09:27:01.0", "lenderName": "Chase(273)", "loanAmount": 150000, "lockPeriod": 30, "upfrontFee": 0, "downPayment": 75000, "eligibility": {"comments": "", "eligibilityCheck": "Pass"}, "loanProgram": "Conf 30 Yr Fixed ", "productName": "FNMA 30 Yr Fixed Agency", "interestRate": 5.625, "searchParams": {"loanAmount": 150000, "creditScore": "800+", "downPayment": 75000, "loanPurpose": "Purchase", "purchasePrice": 225000}, "pricingStatus": "Active", "monthlyPayment": 863.48, "monthlyPremium": 0, "originationFee": 0}	2026-01-30 19:04:29.971644	2026-01-30 19:04:29.971644
\.


--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.templates (id, name, slug, description, preview_image, is_active, is_premium, created_at, updated_at, is_default, user_id, colors, typography, content, layout, advanced, classes, header_modifications, body_modifications, right_sidebar_modifications, layout_config, is_selected, footer_modifications) FROM stdin;
46a05533-dfd8-457d-a25b-94c46669f6bd	Red Theme	template1	Modern blue theme with clean design	/templates/template1-preview.png	t	f	2025-10-23 13:07:16.78019	2026-01-23 00:10:41.09	f	11181907-e372-48c9-8f40-26a675d37a57	{"text": "#111827", "border": "#e5e7eb", "primary": "#005b7c", "secondary": "#01bcc6", "background": "#ffffff", "heroTextColor": "#ffffff", "textSecondary": "#6b7280", "backgroundType": "gradient"}	{"fontSize": 16, "fontFamily": "Inter", "fontWeight": {"bold": 700, "light": 300, "medium": 500, "normal": 400, "semibold": 600}}	{"ctaText": "Get Started", "tagline": "Your trusted partner", "headline": "Welcome to Our Service", "companyName": "Your Company", "subheadline": "Get started with our amazing platform today.", "ctaSecondary": "Learn More"}	{"padding": 24, "spacing": 16, "alignment": "center", "borderRadius": 8}	{"customCSS": "", "accessibility": true}	{}	{"phone": "1234567899", "avatar": "https://res.cloudinary.com/dswaqpgfg/image/upload/v1767868733/avatars/cfmbew2nyh2bslzyp5fv.jpg", "twitter": "https://X.com", "facebook": "https://facebook.com", "linkedin": "https://linkedin.com", "instagram": "https://instagram.com", "applyNowLink": "", "applyNowText": "Apply Now"}	{"activeTab": "todays-rates", "enabledTabs": ["todays-rates", "get-custom-rate", "document-checklist", "my-home-value", "find-my-home", "learning-center", "neighborhood-reports", "calculators"], "homeValueWidgetUrl": "http://app.cloudcma.com/api_widget/8b8c909dd5012044c05bc689000879ee/show?post_url=https://app.cloudcma.com&source_url=ua"}	{"twitter": "https://X.com", "facebook": "https://facebook.com", "linkedin": "https://linkedin.com", "instagram": "https://instagram.com", "companyName": "", "layoutConfig": {"mainContentLayout": {"showRightSidebar": false}}}	{}	t	{}
a4e86576-2273-4bf1-814f-0631060f77da	Red Theme	template1	Modern blue theme with clean design	/templates/template1-preview.png	t	f	2025-10-23 12:52:49.276748	2025-10-23 12:52:49.276748	t	\N	{"text": "#111827", "border": "#e5e7eb", "primary": "#064E3B", "secondary": "#D4AF37", "background": "#ffffff", "textSecondary": "#6b7280"}	{"fontSize": 16, "fontFamily": "Inter", "fontWeight": {"bold": 700, "light": 300, "medium": 500, "normal": 400, "semibold": 600}}	{"ctaText": "Get Started", "tagline": "Your trusted partner", "headline": "Welcome to Our Service", "companyName": "Your Company", "subheadline": "Get started with our amazing platform today.", "ctaSecondary": "Learn More"}	{"padding": 24, "spacing": 16, "alignment": "center", "borderRadius": 8}	{"customCSS": "", "accessibility": true}	{}	{"email": "john.smith@company.com", "phone": "(555) 123-4567", "avatar": "/avatars/default.jpg", "officerName": "John Smith", "applyNowLink": "#apply", "applyNowText": "Apply Now"}	{"activeTab": "todays-rates", "enabledTabs": ["todays-rates", "find-my-loan", "get-custom-rate", "calculators", "about-us"]}	{"logo": "/logos/company-logo.png", "email": "info@premiermortgage.com", "phone": "(555) 123-4567", "address": "123 Main St, New York, NY 10001", "twitter": "https://twitter.com/company", "facebook": "https://facebook.com/company", "linkedin": "https://linkedin.com/company", "instagram": "https://instagram.com/company", "companyName": "Premier Mortgage Group"}	{}	f	{}
36864347-f93c-4909-a936-5c7d7c7efc49	Purple Theme	template2	Elegant purple and red theme with professional look	/templates/template2-preview.png	t	f	2026-01-06 15:02:51.415911	2026-01-08 14:13:44.041	f	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	{"text": "#111827", "border": "#e5e7eb", "primary": "#000000", "secondary": "#62a0ea", "background": "#ffffff", "heroTextColor": "#ffffff", "textSecondary": "#6b7280"}	{"fontSize": 16, "fontFamily": "Inter", "fontWeight": {"bold": 700, "light": 300, "medium": 500, "normal": 400, "semibold": 600}}	{"ctaText": "Get Started", "tagline": "Your trusted partner", "headline": "Welcome to Our Service", "companyName": "Your Company", "subheadline": "Get started with our amazing platform today.", "ctaSecondary": "Learn More"}	{"padding": 24, "spacing": 16, "alignment": "center", "borderRadius": 1}	{"customCSS": "", "accessibility": true}	{}	{"phone": "1234567890", "avatar": "https://res.cloudinary.com/dswaqpgfg/image/upload/v1767878698/avatars/czcjw2kuyoudpba8yhrg.jpg", "twitter": "https://x.com", "facebook": "https://facebook.com", "linkedin": "https://linkedin.com", "instagram": "https://instagram.com"}	{}	{}	{}	f	{}
89bd0951-a586-43aa-b79d-80cf0e77ed8f	Red Theme	template1	Modern blue theme with clean design	/templates/template1-preview.png	t	f	2026-01-06 15:02:51.004271	2026-01-23 20:27:38.562	f	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	{"text": "#111827", "border": "#e5e7eb", "primary": "#000000", "secondary": "#62a0ea", "background": "#ffffff", "heroTextColor": "#ffffff", "textSecondary": "#6b7280", "backgroundType": "gradient"}	{"fontSize": 16, "fontFamily": "Inter", "fontWeight": {"bold": 700, "light": 300, "medium": 500, "normal": 400, "semibold": 600}}	{"ctaText": "Get Started", "tagline": "Your trusted partner", "headline": "Welcome to Our Service", "companyName": "Your Company", "subheadline": "Get started with our amazing platform today.", "ctaSecondary": "Learn More"}	{"padding": 24, "spacing": 16, "alignment": "center", "borderRadius": 8}	{"customCSS": "", "accessibility": true}	{}	{"phone": "1234567899", "avatar": "https://res.cloudinary.com/dswaqpgfg/image/upload/v1767868733/avatars/cfmbew2nyh2bslzyp5fv.jpg", "twitter": "https://X.com", "facebook": "https://facebook.com", "linkedin": "https://linkedin.com", "instagram": "https://instagram.com", "applyNowLink": "", "applyNowText": "Apply Now"}	{"activeTab": "todays-rates", "enabledTabs": ["todays-rates", "get-custom-rate", "document-checklist", "my-home-value", "find-my-home", "learning-center", "neighborhood-reports", "calculators"], "homeValueWidgetUrl": "http://app.cloudcma.com/api_widget/8b8c909dd5012044c05bc689000879ee/show?post_url=https://app.cloudcma.com&source_url=ua"}	{"twitter": "https://X.com", "facebook": "https://facebook.com", "linkedin": "https://linkedin.com", "instagram": "https://instagram.com", "companyName": "", "layoutConfig": {"mainContentLayout": {"showRightSidebar": false}}}	{}	t	{"textColor": "#ffffff"}
b66ec2f0-0d9c-4897-909d-8d832eb4a6f4	Red Theme - husseeee tiger	template1	Modern blue theme with clean design (Personalized for husseeee tiger)	/templates/template1-preview.png	t	f	2026-02-03 09:50:16.982969	2026-02-03 09:50:16.982969	f	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	{"text": "#111827", "border": "#e5e7eb", "primary": "#064E3B", "secondary": "#D4AF37", "background": "#ffffff", "textSecondary": "#6b7280"}	{"fontSize": 16, "fontFamily": "Inter", "fontWeight": {"bold": 700, "light": 300, "medium": 500, "normal": 400, "semibold": 600}}	{"ctaText": "Get Started", "tagline": "Your trusted partner", "headline": "Welcome to Our Service", "companyName": "Your Company", "subheadline": "Get started with our amazing platform today.", "ctaSecondary": "Learn More"}	{"padding": 24, "spacing": 16, "alignment": "center", "borderRadius": 8}	{"customCSS": "", "accessibility": true}	{}	{}	{}	{}	{}	f	{}
d028aa0e-ea46-4599-b84b-b99901546b10	Purple Theme - husseeee tiger	template2	Elegant purple and red theme with professional look (Personalized for husseeee tiger)	/templates/template2-preview.png	t	f	2026-02-03 09:50:17.302665	2026-02-03 09:50:17.302665	f	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	{"text": "#111827", "border": "#e5e7eb", "primary": "#000000", "secondary": "#62a0ea", "background": "#ffffff", "textSecondary": "#6b7280"}	{"fontSize": 16, "fontFamily": "Inter", "fontWeight": {"bold": 700, "light": 300, "medium": 500, "normal": 400, "semibold": 600}}	{"ctaText": "Get Started", "tagline": "Your trusted partner", "headline": "Welcome to Our Service", "companyName": "Your Company", "subheadline": "Get started with our amazing platform today.", "ctaSecondary": "Learn More"}	{"padding": 24, "spacing": 16, "alignment": "center", "borderRadius": 1}	{"customCSS": "", "accessibility": true}	{}	{}	{}	{}	{}	f	{}
181d1587-639b-4e2c-bfed-a2251cf9f866	Purple Elegant	template2	Elegant purple and red theme with professional look	/templates/template2-preview.png	t	f	2025-10-23 13:07:17.126885	2025-11-29 19:57:39.185	f	11181907-e372-48c9-8f40-26a675d37a57	{"text": "#111111", "border": "#e5e7eb", "primary": "#000000", "secondary": "#62a0ea", "background": "#ffffff", "textSecondary": "#6b7280"}	{"fontSize": 16, "fontFamily": "Inter", "fontWeight": {"bold": 700, "medium": 500, "normal": 400, "semibold": 600}}	{"ctaText": "Get rates", "tagline": "Real-time demo", "headline": "Find the best loan for you", "companyName": "LoanPro", "subheadline": "Compare today's rates and apply directly with our loan officers", "ctaSecondary": "Learn more"}	{"padding": {"large": 24, "small": 8, "medium": 16, "xlarge": 32}, "spacing": 18, "alignment": "center", "borderRadius": 1}	{"customCSS": "", "accessibility": true}	{"body": {"xs": "text-xs text-gray-500 leading-normal", "base": "text-base text-gray-700 leading-relaxed", "large": "text-lg text-gray-700 leading-relaxed", "small": "text-sm text-gray-600 leading-relaxed"}, "card": {"body": "px-6 py-4", "footer": "px-6 py-4 border-t border-gray-200 bg-gray-50", "header": "px-6 py-4 border-b border-gray-200", "container": "bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"}, "hero": {"overlay": "bg-gradient-to-br from-purple-900/90 via-purple-800/90 to-violet-900/90", "background": "bg-gradient-to-br from-purple-900 via-purple-800 to-violet-900"}, "icon": {"small": "w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center", "primary": "w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4", "secondary": "w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3"}, "input": {"base": "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200", "error": "border-red-300 focus:ring-red-500 focus:border-red-500", "success": "border-green-300 focus:ring-green-500 focus:border-green-500"}, "button": {"ghost": "text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-lg font-medium transition-all duration-200", "outline": "border-2 border-purple-200 hover:border-purple-300 text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-6 py-3 rounded-lg font-medium transition-all duration-200", "primary": "bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md", "secondary": "bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-gray-300"}, "select": {"base": "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"}, "status": {"info": "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium", "error": "bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium", "success": "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium", "warning": "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"}, "heading": {"h1": "text-3xl font-bold text-gray-900 mb-4", "h2": "text-2xl font-bold text-gray-900 mb-3", "h3": "text-xl font-semibold text-gray-900 mb-2", "h4": "text-lg font-semibold text-gray-900 mb-2", "h5": "text-base font-semibold text-gray-900 mb-2", "h6": "text-sm font-semibold text-gray-900 mb-1"}, "sidebar": {"logo": {"text": "text-white", "background": "bg-purple-600"}, "container": "bg-white border-2 border-purple-200 rounded-lg p-6"}, "navigation": {"tab": {"base": "px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer", "hover": "hover:bg-purple-50 hover:text-purple-700", "active": "bg-purple-600 text-white shadow-md", "inactive": "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}, "container": "flex flex-wrap gap-2 p-4"}}	{}	{}	{}	{}	f	{}
fc7ee307-687c-4eed-bb1c-5e23680c47a2	Purple Theme	template2	Elegant purple and red theme with professional look	/templates/template2-preview.png	t	f	2025-10-23 12:52:49.99357	2025-10-23 12:52:49.99357	t	\N	{"text": "#111827", "border": "#e5e7eb", "primary": "#000000", "secondary": "#62a0ea", "background": "#ffffff", "textSecondary": "#6b7280"}	{"fontSize": 16, "fontFamily": "Inter", "fontWeight": {"bold": 700, "light": 300, "medium": 500, "normal": 400, "semibold": 600}}	{"ctaText": "Get Started", "tagline": "Your trusted partner", "headline": "Welcome to Our Service", "companyName": "Your Company", "subheadline": "Get started with our amazing platform today.", "ctaSecondary": "Learn More"}	{"padding": 24, "spacing": 16, "alignment": "center", "borderRadius": 1}	{"customCSS": "", "accessibility": true}	{}	{"email": "sarah.johnson@company.com", "phone": "(555) 987-6543", "avatar": "/avatars/default.jpg", "officerName": "Sarah Johnson", "applyNowLink": "#apply", "applyNowText": "Apply Now"}	{"activeTab": "todays-rates", "enabledTabs": ["todays-rates", "find-my-loan", "get-custom-rate", "calculators", "about-us"]}	{"logo": "/logos/company-logo.png", "email": "info@elitehomeloans.com", "phone": "(555) 987-6543", "address": "456 Oak Ave, Los Angeles, CA 90210", "twitter": "https://twitter.com/company", "facebook": "https://facebook.com/company", "linkedin": "https://linkedin.com/company", "instagram": "https://instagram.com/company", "companyName": "Elite Home Loans"}	{}	f	{}
\.


--
-- Data for Name: user_companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_companies (id, user_id, company_id, role, permissions, is_active, joined_at) FROM stdin;
ce7713d9-0704-4f87-bc38-ffb1fa194587	2305fed5-ed7c-42ee-99db-3223e3b2ea06	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	admin	[]	t	2026-01-06 13:43:31.782874
66fe9ea7-ff03-4991-93b3-d6f4616e44ae	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	employee	[]	t	2026-01-06 15:02:50.390349
3fffe508-14db-4c76-bd9d-87cf1286030b	0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	employee	[]	t	2026-01-06 15:04:02.390562
aa4e1377-f452-4c9a-8a60-63b42af82ab4	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	employee	[]	t	2026-02-03 09:50:16.295819
4179a16a-ef07-45b3-bec7-29f06a163393	38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	fb47ea33-5d83-4a8b-b670-b0ee993e36d0	employee	[]	t	2026-02-03 09:51:52.261913
70b3f83f-bd94-4414-a843-3b71ab722ec1	b6a99233-868e-4743-9b8e-40223fb4f9e8	8397bc63-e24e-4897-ad56-4d48d6efd130	admin	[]	t	2025-10-23 13:06:02.198984
ecd07126-8099-453f-9783-cd0b37b2f507	11181907-e372-48c9-8f40-26a675d37a57	8397bc63-e24e-4897-ad56-4d48d6efd130	employee	[]	t	2025-10-23 13:07:16.280502
a36e7728-b2e0-4d5c-b9bf-70f5fc6b894a	11181907-e372-48c9-8f40-26a675d37a57	8397bc63-e24e-4897-ad56-4d48d6efd130	employee	[]	t	2025-10-23 13:16:49.998405
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, first_name, last_name, phone, avatar, role, is_active, last_login_at, created_at, updated_at, deactivated, invite_status, invite_sent_at, invite_expires_at, invite_token, nmls_number) FROM stdin;
ec497a26-965a-465d-a87d-f4a64c0106bc	admin@loanplatform.com	Super	Admin	(555) 000-0000	\N	super_admin	t	\N	2025-10-23 13:03:17.834376	2025-10-23 13:03:17.834376	f	accepted	\N	\N	\N	\N
b6a99233-868e-4743-9b8e-40223fb4f9e8	abdulrehman@sudostudy.com			\N	\N	company_admin	t	\N	2025-10-23 13:06:01.879096	2025-10-23 13:06:01.879096	f	pending	\N	\N	\N	\N
11181907-e372-48c9-8f40-26a675d37a57	effectedars29@gmail.com	star	boy	\N	\N	employee	t	\N	2025-10-23 13:07:15.633327	2025-10-23 13:07:15.633327	f	sent	2025-10-23 13:07:15.565	2025-10-24 13:07:15.565	\N	123456
0b4cb424-440d-4f42-8bf9-a0dfdbf16d7b	l227870@lhr.nu.edu.pk	Rabi	Uddin	\N	\N	employee	t	\N	2026-01-06 15:02:49.994058	2026-01-06 15:02:49.994058	f	sent	2026-01-06 15:02:49.903	2026-01-07 15:02:49.903	\N	123456
38b56d65-fe46-4865-aa7c-ae8ba8c72bbf	hussnainali50674@gmail.com	husseeee	tiger	\N	\N	employee	t	\N	2026-02-03 09:50:15.813347	2026-02-03 09:50:15.813347	f	sent	2026-02-03 09:50:15.704	2026-02-04 09:50:15.704	\N	9876
2305fed5-ed7c-42ee-99db-3223e3b2ea06	rabiuddin1@gmail.com			\N	\N	company_admin	t	\N	2026-01-06 13:43:31.493709	2026-01-06 13:43:31.493709	f	pending	\N	\N	\N	\N
\.


--
-- Data for Name: messages_2025_09_09; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_09_09 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_09_10; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_09_10 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_09_11; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_09_11 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_09_12; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_09_12 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_09_13; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_09_13 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_09_14; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_09_14 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-09-04 11:30:00
20211116045059	2025-09-04 11:30:00
20211116050929	2025-09-04 11:30:00
20211116051442	2025-09-04 11:30:00
20211116212300	2025-09-04 11:30:00
20211116213355	2025-09-04 11:30:00
20211116213934	2025-09-04 11:30:00
20211116214523	2025-09-04 11:30:00
20211122062447	2025-09-04 11:30:00
20211124070109	2025-09-04 11:30:00
20211202204204	2025-09-04 11:30:00
20211202204605	2025-09-04 11:30:00
20211210212804	2025-09-04 11:30:00
20211228014915	2025-09-04 11:30:00
20220107221237	2025-09-04 11:30:00
20220228202821	2025-09-04 11:30:00
20220312004840	2025-09-04 11:30:00
20220603231003	2025-09-04 11:30:00
20220603232444	2025-09-04 11:30:00
20220615214548	2025-09-04 11:30:00
20220712093339	2025-09-04 11:30:00
20220908172859	2025-09-04 11:30:01
20220916233421	2025-09-04 11:30:01
20230119133233	2025-09-04 11:30:01
20230128025114	2025-09-04 11:30:01
20230128025212	2025-09-04 11:30:01
20230227211149	2025-09-04 11:30:01
20230228184745	2025-09-04 11:30:01
20230308225145	2025-09-04 11:30:01
20230328144023	2025-09-04 11:30:01
20231018144023	2025-09-04 11:30:01
20231204144023	2025-09-04 11:30:01
20231204144024	2025-09-04 11:30:01
20231204144025	2025-09-04 11:30:01
20240108234812	2025-09-04 11:30:01
20240109165339	2025-09-04 11:30:01
20240227174441	2025-09-04 11:30:01
20240311171622	2025-09-04 11:30:01
20240321100241	2025-09-04 11:30:01
20240401105812	2025-09-04 11:30:01
20240418121054	2025-09-04 11:30:01
20240523004032	2025-09-04 11:30:01
20240618124746	2025-09-04 11:30:01
20240801235015	2025-09-04 11:30:01
20240805133720	2025-09-04 11:30:01
20240827160934	2025-09-04 11:30:01
20240919163303	2025-09-04 11:30:01
20240919163305	2025-09-04 11:30:01
20241019105805	2025-09-04 11:30:01
20241030150047	2025-09-04 11:30:01
20241108114728	2025-09-04 11:30:01
20241121104152	2025-09-04 11:30:01
20241130184212	2025-09-04 11:30:01
20241220035512	2025-09-04 11:30:01
20241220123912	2025-09-04 11:30:01
20241224161212	2025-09-04 11:30:01
20250107150512	2025-09-04 11:30:01
20250110162412	2025-09-04 11:30:01
20250123174212	2025-09-04 11:30:01
20250128220012	2025-09-04 11:30:01
20250506224012	2025-09-04 11:30:01
20250523164012	2025-09-04 11:30:01
20250714121412	2025-09-04 11:30:01
20250905041441	2025-10-23 11:54:21
20251103001201	2025-11-27 09:56:53
20251120212548	2026-02-06 19:38:44
20251120215549	2026-02-06 19:38:44
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-09-04 11:30:00.740242
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-09-04 11:30:00.754586
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-09-04 11:30:00.765811
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-09-04 11:30:00.836952
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-09-04 11:30:01.140461
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-09-04 11:30:01.145433
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-09-04 11:30:01.153542
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-09-04 11:30:01.158452
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-09-04 11:30:01.163733
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-09-04 11:30:01.169624
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-09-04 11:30:01.175222
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-09-04 11:30:01.180268
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-09-04 11:30:01.186329
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-09-04 11:30:01.192628
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-09-04 11:30:01.197561
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-09-04 11:30:01.241704
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-09-04 11:30:01.248194
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-09-04 11:30:01.312193
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-09-04 11:30:01.32757
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-09-04 11:30:01.334297
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-09-04 11:30:01.339312
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-09-04 11:30:01.34643
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-09-04 11:30:01.386036
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-09-04 11:30:01.405903
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-09-04 11:30:01.411975
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-09-04 11:30:01.418491
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-09-04 14:06:56.033188
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-09-04 14:06:56.108894
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-09-04 14:06:56.119217
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-09-04 14:06:56.128155
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-09-04 14:06:56.131346
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-09-04 14:06:56.136927
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-09-04 14:06:56.143575
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-09-04 14:06:56.150373
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-09-04 14:06:56.151901
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-09-04 14:06:56.157269
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-09-04 14:06:56.160739
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-09-04 14:06:56.173038
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-09-04 14:06:56.17646
39	add-search-v2-sort-support	39cf7d1e6bf515f4b02e41237aba845a7b492853	2025-10-23 11:54:43.787022
40	fix-prefix-race-conditions-optimized	fd02297e1c67df25a9fc110bf8c8a9af7fb06d1f	2025-10-23 11:54:43.832013
41	add-object-level-update-trigger	44c22478bf01744b2129efc480cd2edc9a7d60e9	2025-10-23 11:54:43.857234
42	rollback-prefix-triggers	f2ab4f526ab7f979541082992593938c05ee4b47	2025-10-23 11:54:43.864948
43	fix-object-level	ab837ad8f1c7d00cc0b7310e989a23388ff29fc6	2025-10-23 11:54:43.872103
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2025-11-25 08:25:23.702568
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2025-11-25 08:25:23.738954
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2025-11-25 08:25:24.00689
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2025-11-25 08:25:24.106174
48	iceberg-catalog-ids	2666dff93346e5d04e0a878416be1d5fec345d6f	2025-11-25 08:25:24.308783
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-01-06 11:27:00.522231
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 885, true);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 35, true);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: analytics analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: companies companies_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_slug_unique UNIQUE (slug);


--
-- Name: email_verifications email_verifications_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_email_key UNIQUE (email);


--
-- Name: email_verifications email_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: loan_officer_public_links loan_officer_public_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_officer_public_links
    ADD CONSTRAINT loan_officer_public_links_pkey PRIMARY KEY (id);


--
-- Name: loan_officer_public_links loan_officer_public_links_public_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_officer_public_links
    ADD CONSTRAINT loan_officer_public_links_public_slug_unique UNIQUE (public_slug);


--
-- Name: mortech_api_calls mortech_api_calls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mortech_api_calls
    ADD CONSTRAINT mortech_api_calls_pkey PRIMARY KEY (id);


--
-- Name: mortech_email_rate_limits mortech_email_rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mortech_email_rate_limits
    ADD CONSTRAINT mortech_email_rate_limits_pkey PRIMARY KEY (id);


--
-- Name: officer_content_faqs officer_content_faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.officer_content_faqs
    ADD CONSTRAINT officer_content_faqs_pkey PRIMARY KEY (id);


--
-- Name: officer_content_guides officer_content_guides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.officer_content_guides
    ADD CONSTRAINT officer_content_guides_pkey PRIMARY KEY (id);


--
-- Name: officer_content_videos officer_content_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.officer_content_videos
    ADD CONSTRAINT officer_content_videos_pkey PRIMARY KEY (id);


--
-- Name: page_settings page_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_settings
    ADD CONSTRAINT page_settings_pkey PRIMARY KEY (id);


--
-- Name: page_settings_versions page_settings_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_settings_versions
    ADD CONSTRAINT page_settings_versions_pkey PRIMARY KEY (id);


--
-- Name: public_link_usage public_link_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_link_usage
    ADD CONSTRAINT public_link_usage_pkey PRIMARY KEY (id);


--
-- Name: rate_data rate_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_data
    ADD CONSTRAINT rate_data_pkey PRIMARY KEY (id);


--
-- Name: selected_rates selected_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.selected_rates
    ADD CONSTRAINT selected_rates_pkey PRIMARY KEY (id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: user_companies user_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT user_companies_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_09 messages_2025_09_09_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_09
    ADD CONSTRAINT messages_2025_09_09_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_10 messages_2025_09_10_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_10
    ADD CONSTRAINT messages_2025_09_10_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_11 messages_2025_09_11_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_11
    ADD CONSTRAINT messages_2025_09_11_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_12 messages_2025_09_12_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_12
    ADD CONSTRAINT messages_2025_09_12_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_13 messages_2025_09_13_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_13
    ADD CONSTRAINT messages_2025_09_13_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_14 messages_2025_09_14_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_14
    ADD CONSTRAINT messages_2025_09_14_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: access_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX access_time_idx ON public.public_link_usage USING btree (accessed_at);


--
-- Name: analytics_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analytics_company_idx ON public.analytics USING btree (company_id);


--
-- Name: analytics_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analytics_created_at_idx ON public.analytics USING btree (created_at);


--
-- Name: analytics_event_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analytics_event_idx ON public.analytics USING btree (event);


--
-- Name: analytics_officer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analytics_officer_idx ON public.analytics USING btree (officer_id);


--
-- Name: api_keys_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX api_keys_active_idx ON public.api_keys USING btree (is_active);


--
-- Name: api_keys_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX api_keys_company_idx ON public.api_keys USING btree (company_id);


--
-- Name: api_keys_service_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX api_keys_service_idx ON public.api_keys USING btree (service);


--
-- Name: companies_approval_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX companies_approval_status_idx ON public.companies USING btree (company_approval_status);


--
-- Name: companies_license_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX companies_license_number_idx ON public.companies USING btree (license_number);


--
-- Name: companies_nmls_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX companies_nmls_number_idx ON public.companies USING btree (company_nmls_number);


--
-- Name: companies_version_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX companies_version_idx ON public.companies USING btree (company_version);


--
-- Name: company_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX company_active_idx ON public.companies USING btree (is_active);


--
-- Name: company_admin_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX company_admin_email_idx ON public.companies USING btree (admin_email);


--
-- Name: company_link_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX company_link_idx ON public.loan_officer_public_links USING btree (company_id);


--
-- Name: company_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX company_slug_idx ON public.companies USING btree (slug);


--
-- Name: email_verifications_code_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_verifications_code_expires_at_idx ON public.email_verifications USING btree (code_expires_at);


--
-- Name: email_verifications_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_verifications_email_idx ON public.email_verifications USING btree (email);


--
-- Name: idx_loan_officer_public_links_public_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loan_officer_public_links_public_slug ON public.loan_officer_public_links USING btree (public_slug);


--
-- Name: idx_page_settings_officer_published_updated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_page_settings_officer_published_updated ON public.page_settings USING btree (officer_id, is_published, updated_at DESC);


--
-- Name: idx_templates_slug_default_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_slug_default_active ON public.templates USING btree (slug, is_default, is_active);


--
-- Name: idx_templates_user_selected_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_user_selected_active ON public.templates USING btree (user_id, is_selected, is_active);


--
-- Name: idx_templates_user_slug_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_templates_user_slug_active ON public.templates USING btree (user_id, slug, is_active);


--
-- Name: leads_closing_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_closing_date_idx ON public.leads USING btree (closing_date);


--
-- Name: leads_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_company_idx ON public.leads USING btree (company_id);


--
-- Name: leads_conversion_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_conversion_date_idx ON public.leads USING btree (conversion_date);


--
-- Name: leads_conversion_stage_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_conversion_stage_idx ON public.leads USING btree (conversion_stage);


--
-- Name: leads_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_created_at_idx ON public.leads USING btree (created_at);


--
-- Name: leads_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_email_idx ON public.leads USING btree (email);


--
-- Name: leads_location_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_location_idx ON public.leads USING btree (geographic_location);


--
-- Name: leads_officer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_officer_idx ON public.leads USING btree (officer_id);


--
-- Name: leads_quality_score_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_quality_score_idx ON public.leads USING btree (lead_quality_score);


--
-- Name: leads_response_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_response_time_idx ON public.leads USING btree (response_time_hours);


--
-- Name: leads_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_status_idx ON public.leads USING btree (status);


--
-- Name: link_usage_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX link_usage_idx ON public.public_link_usage USING btree (link_id);


--
-- Name: mortech_api_calls_called_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mortech_api_calls_called_at_idx ON public.mortech_api_calls USING btree (called_at);


--
-- Name: mortech_api_calls_officer_called_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mortech_api_calls_officer_called_at_idx ON public.mortech_api_calls USING btree (officer_id, called_at);


--
-- Name: mortech_api_calls_officer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mortech_api_calls_officer_idx ON public.mortech_api_calls USING btree (officer_id);


--
-- Name: mortech_email_rate_limits_called_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mortech_email_rate_limits_called_at_idx ON public.mortech_email_rate_limits USING btree (called_at);


--
-- Name: mortech_email_rate_limits_email_called_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mortech_email_rate_limits_email_called_at_idx ON public.mortech_email_rate_limits USING btree (email, called_at);


--
-- Name: mortech_email_rate_limits_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mortech_email_rate_limits_email_idx ON public.mortech_email_rate_limits USING btree (email);


--
-- Name: officer_content_faqs_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX officer_content_faqs_category_idx ON public.officer_content_faqs USING btree (category);


--
-- Name: officer_content_faqs_officer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX officer_content_faqs_officer_idx ON public.officer_content_faqs USING btree (officer_id);


--
-- Name: officer_content_guides_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX officer_content_guides_category_idx ON public.officer_content_guides USING btree (category);


--
-- Name: officer_content_guides_officer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX officer_content_guides_officer_idx ON public.officer_content_guides USING btree (officer_id);


--
-- Name: officer_content_videos_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX officer_content_videos_category_idx ON public.officer_content_videos USING btree (category);


--
-- Name: officer_content_videos_officer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX officer_content_videos_officer_idx ON public.officer_content_videos USING btree (officer_id);


--
-- Name: page_settings_company_template_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX page_settings_company_template_idx ON public.page_settings USING btree (company_id, template);


--
-- Name: page_settings_officer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX page_settings_officer_idx ON public.page_settings USING btree (officer_id);


--
-- Name: page_settings_published_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX page_settings_published_idx ON public.page_settings USING btree (is_published);


--
-- Name: page_settings_template_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX page_settings_template_idx ON public.page_settings USING btree (template_id);


--
-- Name: page_settings_version_company_template_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX page_settings_version_company_template_idx ON public.page_settings_versions USING btree (company_id, template);


--
-- Name: page_settings_version_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX page_settings_version_idx ON public.page_settings_versions USING btree (version);


--
-- Name: page_settings_version_page_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX page_settings_version_page_idx ON public.page_settings_versions USING btree (page_settings_id);


--
-- Name: public_link_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX public_link_active_idx ON public.loan_officer_public_links USING btree (is_active);


--
-- Name: public_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX public_slug_idx ON public.loan_officer_public_links USING btree (public_slug);


--
-- Name: rate_data_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rate_data_active_idx ON public.rate_data USING btree (is_active);


--
-- Name: rate_data_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rate_data_company_idx ON public.rate_data USING btree (company_id);


--
-- Name: rate_data_expires_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rate_data_expires_idx ON public.rate_data USING btree (expires_at);


--
-- Name: rate_data_loan_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rate_data_loan_type_idx ON public.rate_data USING btree (loan_type);


--
-- Name: selected_rates_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX selected_rates_company_idx ON public.selected_rates USING btree (company_id);


--
-- Name: selected_rates_officer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX selected_rates_officer_idx ON public.selected_rates USING btree (officer_id);


--
-- Name: template_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX template_active_idx ON public.templates USING btree (is_active);


--
-- Name: template_default_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX template_default_idx ON public.templates USING btree (is_default);


--
-- Name: template_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX template_slug_idx ON public.templates USING btree (slug);


--
-- Name: template_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX template_user_idx ON public.templates USING btree (user_id);


--
-- Name: template_user_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX template_user_slug_idx ON public.templates USING btree (user_id, slug);


--
-- Name: user_company_company_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_company_company_idx ON public.user_companies USING btree (company_id);


--
-- Name: user_company_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_company_unique_idx ON public.user_companies USING btree (user_id, company_id);


--
-- Name: user_company_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_company_user_idx ON public.user_companies USING btree (user_id);


--
-- Name: user_link_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_link_idx ON public.loan_officer_public_links USING btree (user_id);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_nmls_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_nmls_number_idx ON public.users USING btree (nmls_number);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_09_09_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_09_09_inserted_at_topic_idx ON realtime.messages_2025_09_09 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_09_10_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_09_10_inserted_at_topic_idx ON realtime.messages_2025_09_10 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_09_11_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_09_11_inserted_at_topic_idx ON realtime.messages_2025_09_11 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_09_12_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_09_12_inserted_at_topic_idx ON realtime.messages_2025_09_12 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_09_13_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_09_13_inserted_at_topic_idx ON realtime.messages_2025_09_13 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_09_14_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_09_14_inserted_at_topic_idx ON realtime.messages_2025_09_14 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_key ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: messages_2025_09_09_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_09_09_inserted_at_topic_idx;


--
-- Name: messages_2025_09_09_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_09_pkey;


--
-- Name: messages_2025_09_10_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_09_10_inserted_at_topic_idx;


--
-- Name: messages_2025_09_10_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_10_pkey;


--
-- Name: messages_2025_09_11_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_09_11_inserted_at_topic_idx;


--
-- Name: messages_2025_09_11_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_11_pkey;


--
-- Name: messages_2025_09_12_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_09_12_inserted_at_topic_idx;


--
-- Name: messages_2025_09_12_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_12_pkey;


--
-- Name: messages_2025_09_13_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_09_13_inserted_at_topic_idx;


--
-- Name: messages_2025_09_13_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_13_pkey;


--
-- Name: messages_2025_09_14_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_09_14_inserted_at_topic_idx;


--
-- Name: messages_2025_09_14_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_14_pkey;


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: analytics analytics_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: analytics analytics_officer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_officer_id_users_id_fk FOREIGN KEY (officer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: leads leads_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: leads leads_officer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_officer_id_users_id_fk FOREIGN KEY (officer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: loan_officer_public_links loan_officer_public_links_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_officer_public_links
    ADD CONSTRAINT loan_officer_public_links_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: loan_officer_public_links loan_officer_public_links_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_officer_public_links
    ADD CONSTRAINT loan_officer_public_links_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mortech_api_calls mortech_api_calls_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mortech_api_calls
    ADD CONSTRAINT mortech_api_calls_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: mortech_api_calls mortech_api_calls_officer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mortech_api_calls
    ADD CONSTRAINT mortech_api_calls_officer_id_users_id_fk FOREIGN KEY (officer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: officer_content_faqs officer_content_faqs_officer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.officer_content_faqs
    ADD CONSTRAINT officer_content_faqs_officer_id_users_id_fk FOREIGN KEY (officer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: officer_content_guides officer_content_guides_officer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.officer_content_guides
    ADD CONSTRAINT officer_content_guides_officer_id_users_id_fk FOREIGN KEY (officer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: officer_content_videos officer_content_videos_officer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.officer_content_videos
    ADD CONSTRAINT officer_content_videos_officer_id_users_id_fk FOREIGN KEY (officer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: page_settings page_settings_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_settings
    ADD CONSTRAINT page_settings_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: page_settings page_settings_officer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_settings
    ADD CONSTRAINT page_settings_officer_id_users_id_fk FOREIGN KEY (officer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: page_settings page_settings_template_id_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_settings
    ADD CONSTRAINT page_settings_template_id_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.templates(id);


--
-- Name: page_settings_versions page_settings_versions_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_settings_versions
    ADD CONSTRAINT page_settings_versions_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: page_settings_versions page_settings_versions_officer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_settings_versions
    ADD CONSTRAINT page_settings_versions_officer_id_users_id_fk FOREIGN KEY (officer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: page_settings_versions page_settings_versions_page_settings_id_page_settings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_settings_versions
    ADD CONSTRAINT page_settings_versions_page_settings_id_page_settings_id_fk FOREIGN KEY (page_settings_id) REFERENCES public.page_settings(id) ON DELETE CASCADE;


--
-- Name: public_link_usage public_link_usage_link_id_loan_officer_public_links_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_link_usage
    ADD CONSTRAINT public_link_usage_link_id_loan_officer_public_links_id_fk FOREIGN KEY (link_id) REFERENCES public.loan_officer_public_links(id) ON DELETE CASCADE;


--
-- Name: rate_data rate_data_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_data
    ADD CONSTRAINT rate_data_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: selected_rates selected_rates_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.selected_rates
    ADD CONSTRAINT selected_rates_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: selected_rates selected_rates_officer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.selected_rates
    ADD CONSTRAINT selected_rates_officer_id_users_id_fk FOREIGN KEY (officer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: templates templates_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_companies user_companies_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT user_companies_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: user_companies user_companies_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_companies
    ADD CONSTRAINT user_companies_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict ZgPXZ3gqo7WS7Jue5Tbd3hJYgY5vB50ekwOpMgeFMDhryyZrftNkirmB286AQlm

