--
-- PostgreSQL database dump
--

-- Dumped from database version 15.6 (Debian 15.6-0+deb12u1)
-- Dumped by pg_dump version 15.6 (Debian 15.6-0+deb12u1)

-- Started on 2024-06-03 12:58:15 EEST

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

--
-- TOC entry 863 (class 1247 OID 16431)
-- Name: abonamente; Type: TYPE; Schema: public; Owner: codrut
--

CREATE TYPE public.abonamente AS ENUM (
    'lunar',
    'anual',
    'bianual'
);


ALTER TYPE public.abonamente OWNER TO codrut;

--
-- TOC entry 842 (class 1247 OID 16392)
-- Name: categorie_produs; Type: TYPE; Schema: public; Owner: codrut
--

CREATE TYPE public.categorie_produs AS ENUM (
    'vps',
    'dedicat',
    'storage',
    'gpu',
    'serverless'
);


ALTER TYPE public.categorie_produs OWNER TO codrut;

--
-- TOC entry 848 (class 1247 OID 16417)
-- Name: centru_date; Type: TYPE; Schema: public; Owner: codrut
--

CREATE TYPE public.centru_date AS ENUM (
    'Falkenstein',
    'London',
    'Chicago',
    'Nagoya',
    'Sidney'
);


ALTER TYPE public.centru_date OWNER TO codrut;

--
-- TOC entry 857 (class 1247 OID 16520)
-- Name: ocupatii; Type: TYPE; Schema: public; Owner: codrut
--

CREATE TYPE public.ocupatii AS ENUM (
    'inginer',
    'medic',
    'proiectant',
    'economist',
    'artist',
    'dns'
);


ALTER TYPE public.ocupatii OWNER TO codrut;

--
-- TOC entry 860 (class 1247 OID 16441)
-- Name: roluri; Type: TYPE; Schema: public; Owner: codrut
--

CREATE TYPE public.roluri AS ENUM (
    'admin',
    'moderator',
    'comun'
);


ALTER TYPE public.roluri OWNER TO codrut;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 16498)
-- Name: accesari; Type: TABLE; Schema: public; Owner: codrut
--

CREATE TABLE public.accesari (
    id bigint NOT NULL,
    ip integer NOT NULL,
    user_id bigint NOT NULL,
    data_accesare timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.accesari OWNER TO codrut;

--
-- TOC entry 219 (class 1259 OID 16539)
-- Name: accesari_id_seq; Type: SEQUENCE; Schema: public; Owner: codrut
--

ALTER TABLE public.accesari ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.accesari_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 214 (class 1259 OID 16403)
-- Name: produse; Type: TABLE; Schema: public; Owner: codrut
--

CREATE TABLE public.produse (
    id bigint NOT NULL,
    nume text NOT NULL,
    descriere text,
    imagine text,
    categorie public.categorie_produs NOT NULL,
    pret bigint NOT NULL,
    pret_configurare bigint DEFAULT 0 NOT NULL,
    data_adaugare timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    specificatii text[],
    disponibil boolean DEFAULT true NOT NULL,
    datacenter public.centru_date DEFAULT 'Falkenstein'::public.centru_date NOT NULL,
    abonamente public.abonamente[] DEFAULT '{lunar}'::public.abonamente[] NOT NULL,
    nr_imagini smallint DEFAULT 2 NOT NULL
);


ALTER TABLE public.produse OWNER TO codrut;

--
-- TOC entry 215 (class 1259 OID 16411)
-- Name: produse_id_seq; Type: SEQUENCE; Schema: public; Owner: codrut
--

ALTER TABLE public.produse ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.produse_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 216 (class 1259 OID 16481)
-- Name: utilizatori; Type: TABLE; Schema: public; Owner: codrut
--

CREATE TABLE public.utilizatori (
    id bigint NOT NULL,
    username text NOT NULL,
    nume text,
    prenume text,
    parola text NOT NULL,
    email text NOT NULL,
    confirmat_email boolean DEFAULT false NOT NULL,
    data_adaugare timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cod_confirmare text NOT NULL,
    data_nasterii timestamp without time zone NOT NULL,
    rol public.roluri DEFAULT 'comun'::public.roluri NOT NULL,
    ocupatie public.ocupatii DEFAULT 'dns'::public.ocupatii,
    culoare_chat text DEFAULT 0 NOT NULL,
    probleme_vedere boolean DEFAULT false NOT NULL,
    CONSTRAINT email_max_len CHECK ((length(email) < 100)),
    CONSTRAINT email_valid CHECK ((email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'::text)),
    CONSTRAINT nume_max_len CHECK ((length(nume) < 100)),
    CONSTRAINT parola_len CHECK ((length(parola) = 64)),
    CONSTRAINT prenume_max_len CHECK ((length(prenume) < 100)),
    CONSTRAINT username_max_len CHECK ((length(username) < 50))
);


ALTER TABLE public.utilizatori OWNER TO codrut;

--
-- TOC entry 217 (class 1259 OID 16497)
-- Name: utilizatori_id_seq; Type: SEQUENCE; Schema: public; Owner: codrut
--

ALTER TABLE public.utilizatori ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.utilizatori_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 3401 (class 0 OID 16498)
-- Dependencies: 218
-- Data for Name: accesari; Type: TABLE DATA; Schema: public; Owner: codrut
--

COPY public.accesari (id, ip, user_id, data_accesare) FROM stdin;
146	16777343	28	2024-05-30 15:33:32.282731
147	16777343	28	2024-05-30 15:33:38.564026
148	16777343	28	2024-05-30 15:33:38.624283
149	16777343	28	2024-05-30 15:33:38.65102
150	16777343	28	2024-05-30 15:45:06.397546
151	16777343	28	2024-05-30 15:46:16.390541
152	16777343	14	2024-05-30 20:57:22.984493
153	16777343	14	2024-05-30 20:57:24.382596
154	16777343	14	2024-05-30 20:57:24.439962
155	16777343	14	2024-05-30 20:57:24.463013
156	16777343	14	2024-05-30 20:58:17.328456
157	16777343	14	2024-05-30 20:58:17.552849
158	16777343	14	2024-05-30 20:58:17.590592
159	16777343	14	2024-05-30 20:58:22.798723
160	16777343	14	2024-05-30 20:58:22.815499
161	16777343	14	2024-05-30 20:58:22.875219
162	16777343	14	2024-05-30 20:58:22.930289
163	16777343	14	2024-05-30 20:58:56.606915
164	16777343	14	2024-05-30 20:58:58.22229
165	16777343	14	2024-05-30 20:58:58.30144
166	16777343	14	2024-05-30 20:58:58.373811
167	16777343	14	2024-05-30 21:08:15.150973
168	16777343	14	2024-05-30 21:08:17.097886
169	16777343	14	2024-05-30 21:10:18.96698
170	16777343	14	2024-05-30 22:28:02.135807
171	16777343	14	2024-05-30 22:28:02.344321
172	16777343	14	2024-05-30 22:28:03.498521
173	16777343	14	2024-05-30 22:28:17.943109
174	16777343	27	2024-05-30 22:33:31.496686
175	16777343	27	2024-05-30 22:33:37.521083
176	16777343	27	2024-05-30 22:33:38.25231
177	16777343	27	2024-05-30 22:33:56.162298
178	16777343	14	2024-05-30 22:33:58.952677
179	16777343	14	2024-05-30 22:34:01.975136
180	16777343	14	2024-05-30 22:34:07.262001
181	16777343	27	2024-05-30 22:37:13.844465
182	16777343	27	2024-05-30 22:37:17.41305
183	16777343	14	2024-05-30 22:37:23.779364
184	16777343	14	2024-05-30 22:37:25.537707
185	16777343	14	2024-05-30 22:37:27.571957
186	16777343	14	2024-05-30 22:38:06.322854
187	16777343	14	2024-05-30 22:39:10.141521
188	16777343	14	2024-05-30 22:39:11.556894
189	16777343	14	2024-05-30 22:39:13.377118
190	16777343	14	2024-05-30 23:16:29.032716
191	16777343	14	2024-05-30 23:16:31.705351
192	16777343	14	2024-05-30 23:17:29.955392
193	16777343	14	2024-05-30 23:17:33.879282
194	16777343	14	2024-05-30 23:17:33.946654
195	16777343	14	2024-05-30 23:17:33.970272
196	16777343	14	2024-05-30 23:17:40.004976
197	16777343	14	2024-05-30 23:20:37.101339
198	16777343	14	2024-05-30 23:20:39.492341
199	16777343	14	2024-05-30 23:20:39.547156
200	16777343	14	2024-05-30 23:20:39.570414
201	16777343	14	2024-05-30 23:20:46.557109
202	16777343	14	2024-05-30 23:21:54.836355
203	16777343	14	2024-05-30 23:21:56.356385
204	16777343	14	2024-05-30 23:21:56.415297
205	16777343	14	2024-05-30 23:21:56.439741
206	16777343	14	2024-05-30 23:22:00.076912
207	16777343	14	2024-05-30 23:22:00.093043
208	16777343	14	2024-05-30 23:22:00.138695
209	16777343	14	2024-05-30 23:22:00.163623
210	16777343	14	2024-05-30 23:22:53.468153
211	16777343	14	2024-05-30 23:22:55.009018
212	16777343	14	2024-05-30 23:22:55.070628
213	16777343	14	2024-05-30 23:22:55.097054
214	16777343	14	2024-05-30 23:22:58.346384
215	16777343	14	2024-05-30 23:22:58.362186
216	16777343	14	2024-05-30 23:22:58.403626
217	16777343	14	2024-05-30 23:22:58.431574
218	16777343	14	2024-05-30 23:23:05.098301
219	16777343	14	2024-05-30 23:23:05.113699
220	16777343	14	2024-05-30 23:23:05.174566
221	16777343	14	2024-05-30 23:23:05.198616
222	16777343	14	2024-05-30 23:23:07.776527
223	16777343	14	2024-05-30 23:23:24.965084
224	16777343	14	2024-05-30 23:23:27.114587
225	16777343	14	2024-05-30 23:58:41.448158
226	16777343	14	2024-05-30 23:58:46.331513
227	16777343	27	2024-05-30 23:58:50.86357
228	16777343	27	2024-05-30 23:58:54.53118
229	16777343	27	2024-05-30 23:58:54.607406
230	16777343	27	2024-05-30 23:58:54.629376
231	16777343	27	2024-05-30 23:58:58.394785
232	16777343	27	2024-05-30 23:58:58.408633
233	16777343	27	2024-05-30 23:58:58.455834
234	16777343	27	2024-05-30 23:58:58.47955
235	16777343	27	2024-05-30 23:59:03.104445
236	16777343	27	2024-05-30 23:59:03.119088
237	16777343	27	2024-05-30 23:59:03.162787
238	16777343	27	2024-05-30 23:59:03.185907
239	16777343	14	2024-05-31 14:25:27.648105
240	16777343	14	2024-05-31 14:25:29.098724
241	16777343	14	2024-05-31 14:25:45.250866
242	16777343	14	2024-05-31 14:25:47.694781
243	16777343	14	2024-05-31 14:25:47.87252
244	16777343	14	2024-05-31 14:25:47.884286
245	16777343	14	2024-05-31 14:25:47.88906
246	16777343	14	2024-05-31 14:25:47.892012
247	16777343	14	2024-05-31 14:25:47.894604
248	16777343	14	2024-05-31 14:25:47.897645
249	16777343	14	2024-05-31 14:25:47.900913
250	16777343	14	2024-05-31 14:25:47.903245
251	16777343	14	2024-05-31 14:25:47.905825
252	16777343	14	2024-05-31 14:25:47.908746
253	16777343	14	2024-05-31 14:25:47.912155
254	16777343	14	2024-05-31 14:25:47.914478
255	16777343	14	2024-05-31 14:25:47.916669
256	16777343	14	2024-05-31 14:25:47.918879
257	16777343	14	2024-05-31 14:25:47.921568
258	16777343	14	2024-05-31 14:26:30.147424
259	16777343	14	2024-05-31 14:26:45.707853
260	16777343	14	2024-05-31 14:26:50.137092
261	16777343	14	2024-05-31 14:26:59.273415
262	16777343	14	2024-05-31 14:27:00.263867
263	16777343	14	2024-05-31 14:27:29.00801
264	16777343	14	2024-05-31 14:27:30.896272
265	16777343	14	2024-05-31 14:33:55.046158
266	16777343	14	2024-05-31 14:33:56.747408
267	16777343	14	2024-05-31 14:33:56.961484
268	16777343	14	2024-05-31 14:33:56.969505
269	16777343	14	2024-05-31 14:33:56.974553
270	16777343	14	2024-05-31 14:33:56.977498
271	16777343	14	2024-05-31 14:33:56.980216
272	16777343	14	2024-05-31 14:33:56.982622
273	16777343	14	2024-05-31 14:33:56.984852
274	16777343	14	2024-05-31 14:33:56.987023
275	16777343	14	2024-05-31 14:33:56.98937
276	16777343	14	2024-05-31 14:33:56.992984
277	16777343	14	2024-05-31 14:33:56.99552
278	16777343	14	2024-05-31 14:33:56.997699
279	16777343	14	2024-05-31 14:33:57.00003
280	16777343	14	2024-05-31 14:33:57.002281
281	16777343	14	2024-05-31 14:33:57.004431
282	16777343	14	2024-05-31 14:35:35.840813
283	16777343	14	2024-05-31 14:35:36.306691
284	16777343	14	2024-05-31 14:35:36.309962
285	16777343	14	2024-05-31 14:35:36.312329
286	16777343	14	2024-05-31 14:35:36.315005
287	16777343	14	2024-05-31 14:35:36.317402
288	16777343	14	2024-05-31 14:35:36.319728
289	16777343	14	2024-05-31 14:35:36.322015
290	16777343	14	2024-05-31 14:35:36.324148
291	16777343	14	2024-05-31 14:35:36.326789
292	16777343	14	2024-05-31 14:35:36.329078
293	16777343	14	2024-05-31 14:35:36.332091
294	16777343	14	2024-05-31 14:35:36.334221
295	16777343	14	2024-05-31 14:35:36.336553
296	16777343	14	2024-05-31 14:35:36.338991
297	16777343	14	2024-05-31 14:35:36.341201
298	16777343	14	2024-05-31 14:37:25.138825
299	16777343	14	2024-05-31 20:18:30.003339
300	16777343	14	2024-05-31 20:18:41.135072
301	16777343	14	2024-05-31 20:19:53.088655
302	16777343	14	2024-05-31 20:20:19.106284
303	16777343	14	2024-05-31 20:20:21.168518
304	16777343	14	2024-05-31 20:20:51.123696
305	16777343	14	2024-05-31 20:21:48.369761
306	16777343	14	2024-05-31 20:21:49.970942
307	16777343	14	2024-05-31 20:22:12.87266
308	16777343	14	2024-05-31 20:24:17.484945
309	16777343	14	2024-05-31 20:24:19.127994
310	16777343	14	2024-05-31 20:24:22.040139
311	16777343	14	2024-05-31 20:24:44.106407
312	16777343	14	2024-05-31 20:24:44.122964
313	16777343	14	2024-06-03 11:42:43.535547
314	16777343	14	2024-06-03 11:42:47.10214
315	16777343	14	2024-06-03 11:42:51.329267
316	16777343	14	2024-06-03 11:42:52.70966
317	16777343	14	2024-06-03 11:43:11.805383
318	16777343	27	2024-06-03 11:43:26.558057
319	16777343	27	2024-06-03 11:43:28.325014
320	16777343	27	2024-06-03 11:43:28.380962
321	16777343	27	2024-06-03 11:43:28.404249
322	16777343	27	2024-06-03 11:43:47.400921
323	16777343	27	2024-06-03 11:43:47.416567
324	16777343	27	2024-06-03 11:43:47.470914
325	16777343	27	2024-06-03 11:43:47.499902
326	16777343	27	2024-06-03 11:43:49.176954
327	16777343	27	2024-06-03 11:43:49.227174
328	16777343	27	2024-06-03 11:43:49.258059
329	16777343	27	2024-06-03 11:43:53.871371
330	16777343	14	2024-06-03 11:43:56.219889
331	16777343	14	2024-06-03 11:43:57.547693
332	16777343	14	2024-06-03 11:44:07.148399
333	16777343	14	2024-06-03 11:44:08.877365
334	16777343	14	2024-06-03 11:44:29.764579
335	16777343	14	2024-06-03 11:44:40.917228
336	16777343	14	2024-06-03 11:44:41.074924
337	16777343	14	2024-06-03 11:44:52.049788
338	16777343	14	2024-06-03 11:44:53.058177
339	16777343	14	2024-06-03 11:45:16.602095
340	16777343	14	2024-06-03 11:45:28.348706
341	16777343	14	2024-06-03 11:45:42.242028
342	16777343	14	2024-06-03 11:46:34.277807
343	16777343	14	2024-06-03 11:46:35.712388
344	16777343	14	2024-06-03 11:46:37.224462
345	16777343	14	2024-06-03 11:46:37.354841
346	16777343	14	2024-06-03 11:46:38.421951
347	16777343	14	2024-06-03 11:46:38.534637
348	16777343	14	2024-06-03 11:46:44.554548
349	16777343	14	2024-06-03 11:46:44.669609
350	16777343	14	2024-06-03 11:46:47.647124
351	16777343	14	2024-06-03 11:46:47.770124
352	16777343	14	2024-06-03 11:46:53.785884
353	16777343	14	2024-06-03 11:47:45.08017
354	16777343	14	2024-06-03 11:47:45.162099
355	16777343	14	2024-06-03 11:47:45.188307
356	16777343	14	2024-06-03 11:48:02.833712
357	16777343	14	2024-06-03 11:48:02.848984
358	16777343	14	2024-06-03 11:48:02.897289
359	16777343	14	2024-06-03 11:48:02.924328
360	16777343	14	2024-06-03 11:48:04.572111
361	16777343	14	2024-06-03 11:48:11.169013
362	16777343	14	2024-06-03 11:48:23.235322
363	16777343	14	2024-06-03 11:49:19.528989
364	16777343	14	2024-06-03 11:49:19.709438
365	16777343	14	2024-06-03 11:54:43.314978
366	16777343	14	2024-06-03 11:54:49.059264
367	16777343	14	2024-06-03 11:54:53.789244
368	16777343	14	2024-06-03 11:55:36.228582
369	16777343	14	2024-06-03 11:55:56.650614
370	16777343	14	2024-06-03 11:55:57.436139
371	16777343	14	2024-06-03 12:21:21.366955
372	16777343	14	2024-06-03 12:22:47.116242
373	16777343	14	2024-06-03 12:22:49.06147
374	16777343	14	2024-06-03 12:22:57.112428
375	16777343	14	2024-06-03 12:22:57.186486
376	16777343	14	2024-06-03 12:22:57.216021
377	16777343	14	2024-06-03 12:23:02.395439
378	16777343	14	2024-06-03 12:23:42.583101
\.


--
-- TOC entry 3397 (class 0 OID 16403)
-- Dependencies: 214
-- Data for Name: produse; Type: TABLE DATA; Schema: public; Owner: codrut
--

COPY public.produse (id, nume, descriere, imagine, categorie, pret, pret_configurare, data_adaugare, specificatii, disponibil, datacenter, abonamente, nr_imagini) FROM stdin;
20	Gazduire Jocuri	Servere performante apropiate de jucatori.	sv-csgo	serverless	50	10	2024-05-31 20:24:44.111516	{"'64 Jucatori Max'"}	t	London	{lunar}	1
1	VPS Mic	Pentru proiecte personale sau pentru testat servicii.	vps-1	vps	10	0	2024-04-22 16:36:06.1435	{"'2 vCPU'","'4GB RAM'","'40GB SSD'"}	t	Falkenstein	{lunar}	2
2	VPS Mediu	Pentru intreprinderi mici.	vps-2	vps	20	0	2024-04-22 16:37:40.674725	{"'4 vCPU'","'8GB RAM'","'80GB SSD'"}	t	Falkenstein	{lunar}	2
3	VPS Puternic	Pentru intreprinderi medii.	vps-3	vps	40	0	2024-04-22 16:39:41.611056	{"'8 vCPU'","'16GB RAM'","'160GB SSD'"}	t	Falkenstein	{lunar}	2
4	VPS Max	Pentru intreprinderi mari sau cerinte intensive.	vps-4	vps	80	0	2024-04-22 16:42:55.15296	{"'16 vCPU'","'32GB RAM'","'320GB SSD'"}	t	Falkenstein	{lunar}	2
7	Storage Box	Pentru uz personal, prin WebDAV si FTP.	storage-box	storage	16	0	2024-04-22 16:50:58.44143	{"'4TB HDD'"}	t	Chicago	{lunar}	2
8	Storage S3	Pentru intreprinderi care distribuie si modifica date constant.	s3	storage	128	10	2024-04-22 16:50:58.44143	{"'16TB SSD'"}	t	Chicago	{lunar}	2
13	Web Hosting	Pentru pagini personale.	web-host	serverless	16	0	2024-04-22 17:51:19.050941	{"'10 Subdomenii'","'40GB SSD'","'2TB Bandwidth'"}	t	Chicago	{lunar}	2
11	Server Encoding	Pentru randare video sau grafica 3D.	intel-arc	gpu	96	20	2024-04-22 17:02:35.49702	{"'Intel I9-13900k'","'64GB RAM'","'4 x Intel ARC A770 16GB'","'1TB SSD'"}	t	London	{anual,bianual}	2
14	Elastic Container	Scalare verticala a microserviciilor.	ecs	serverless	80	10	2024-04-22 17:57:45.895662	{}	t	London	{lunar}	2
17	email	Gazduire e-mail.	email	serverless	10	0	2024-04-30 12:31:28.770588	{"'50GB stocare'"}	t	Nagoya	{anual,bianual}	2
18	Remote Desktop	Control de la distanta a unei unitati puternice.	remote-desktop	gpu	60	10	2024-04-30 12:31:28.770588	{"'Ryzen 9 5950x'","'RTX 4060TI 16GB'","'1TB M.2 SSD'"}	f	London	{lunar}	2
19	supabase	Mediu de dezvoltare intuitiv pentru logica aplicatiilor.	supabase	serverless	30	0	2024-04-30 12:31:28.770588	{"'20GB baza de date'","'1GB RAM Edge functions'","'1 vCPU Edge functions'"}	f	Chicago	{lunar}	2
5	Dedicat Mic	Pentru servicii centralizate simple.	ded-1	dedicat	160	20	2024-04-22 16:47:19.714134	{"'AMD Ryzen 5 3600'","'64GB RAM'","'4TB SATA HDD'"}	t	Nagoya	{lunar,anual}	3
6	Dedicat mediu	Pentru servicii centralizate intensive.	ded-2	dedicat	280	40	2024-04-22 16:47:19.714134	{"'AMD Ryzen 7 7700'","'128GB RAM'","'2TB SATA HDD'"}	t	Nagoya	{lunar,anual}	3
12	Server IA	Pentru antrenarea inteligentei artificiale.	nvidia-a100	gpu	286	80	2024-04-22 17:02:35.49702	{"'AMD EPYC 9654'","'1024GB RAM'","'16x NVIDIA A100'","'2TB SSD'"}	t	London	{anual,bianual}	4
\.


--
-- TOC entry 3399 (class 0 OID 16481)
-- Dependencies: 216
-- Data for Name: utilizatori; Type: TABLE DATA; Schema: public; Owner: codrut
--

COPY public.utilizatori (id, username, nume, prenume, parola, email, confirmat_email, data_adaugare, cod_confirmare, data_nasterii, rol, ocupatie, culoare_chat, probleme_vedere) FROM stdin;
24	codrut	Badea	Sabin-Codrut	f0bc402f84c913949d8ab79fa4ee160d0149e742348d9cd86f3f1edc721b7f37	badeacodrut1@gmail.com	t	2024-05-21 15:56:17.686242	pbldswyshhzjbqykkrkszftmbzwfwcprpjblfbrcyjysnnkmrwtwcrkbtfrrhsttcgngnhmtwmgcwkgz	2003-12-09 00:00:00	admin	dns	e01b24	f
28	mr_b0bita	Bobita	Bobescu	2e4b8f80226b985ea4e7093c9117604b634edcf54e24b6d33b39822839f375b3	badeacodrut1@gmail.com	t	2024-05-30 15:32:17.609429	ncgxsggkvrqyflsmfhtdwvwgqcfcpqhdwmqlttqvztttvbdsxdbvqmjfrtrnjpvftxszxmmklkydldrz	2003-09-12 00:00:00	comun	dns	ff7800	f
27	der_boben	Bobita	Bobescu	d11e183170f03f81a32b1570b4bbf9bd38006124b8353669ed51bbf2240b268b	badeacodrut1@gmail.com	t	2024-05-22 11:53:55.740011	hqphtlnqqpryghsctlxhmpcfldvhygrjjvjrshypxrjkhqgvqmmngnpstpxyqmktyncjwhgjsrcdxcqk	2003-09-07 00:00:00	comun	inginer	2ec27e	f
14	bobita	Bobita	Bobescu	d498a5eb337de69303b92a44d26033d7d1afec7c6fbced86c7fbef0296bcbc37	badeacodrut1@gmail.com	t	2024-05-20 19:55:01.407294	mcqhwyftlgfglbqzpgrtsthgjfcvrwjzzlxgcgflfpsrkrvghptcxvxklvztmqndlwchvdxydkmsyprq	2016-11-30 00:00:00	admin	dns	9141ac	f
\.


--
-- TOC entry 3408 (class 0 OID 0)
-- Dependencies: 219
-- Name: accesari_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codrut
--

SELECT pg_catalog.setval('public.accesari_id_seq', 378, true);


--
-- TOC entry 3409 (class 0 OID 0)
-- Dependencies: 215
-- Name: produse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codrut
--

SELECT pg_catalog.setval('public.produse_id_seq', 20, true);


--
-- TOC entry 3410 (class 0 OID 0)
-- Dependencies: 217
-- Name: utilizatori_id_seq; Type: SEQUENCE SET; Schema: public; Owner: codrut
--

SELECT pg_catalog.setval('public.utilizatori_id_seq', 30, true);


--
-- TOC entry 3253 (class 2606 OID 16503)
-- Name: accesari accesari_pkey; Type: CONSTRAINT; Schema: public; Owner: codrut
--

ALTER TABLE ONLY public.accesari
    ADD CONSTRAINT accesari_pkey PRIMARY KEY (id);


--
-- TOC entry 3237 (class 2606 OID 16540)
-- Name: utilizatori cod_confirmare_valid; Type: CHECK CONSTRAINT; Schema: public; Owner: codrut
--

ALTER TABLE public.utilizatori
    ADD CONSTRAINT cod_confirmare_valid CHECK (((length(cod_confirmare) = 80) AND (cod_confirmare ~ '^[bcdfghjklmnpqrstvwxyz]*$'::text))) NOT VALID;


--
-- TOC entry 3238 (class 2606 OID 16510)
-- Name: utilizatori data_nastere_valid; Type: CHECK CONSTRAINT; Schema: public; Owner: codrut
--

ALTER TABLE public.utilizatori
    ADD CONSTRAINT data_nastere_valid CHECK ((data_nasterii <= CURRENT_TIMESTAMP)) NOT VALID;


--
-- TOC entry 3241 (class 2606 OID 16535)
-- Name: utilizatori format_culoare_hex; Type: CHECK CONSTRAINT; Schema: public; Owner: codrut
--

ALTER TABLE public.utilizatori
    ADD CONSTRAINT format_culoare_hex CHECK ((culoare_chat ~* '^[0-9A-Fa-f]{6}$'::text)) NOT VALID;


--
-- TOC entry 3247 (class 2606 OID 16409)
-- Name: produse produse_pkey; Type: CONSTRAINT; Schema: public; Owner: codrut
--

ALTER TABLE ONLY public.produse
    ADD CONSTRAINT produse_pkey PRIMARY KEY (id);


--
-- TOC entry 3249 (class 2606 OID 16538)
-- Name: utilizatori unique_username; Type: CONSTRAINT; Schema: public; Owner: codrut
--

ALTER TABLE ONLY public.utilizatori
    ADD CONSTRAINT unique_username UNIQUE (username);


--
-- TOC entry 3251 (class 2606 OID 16495)
-- Name: utilizatori utilizatori_pkey; Type: CONSTRAINT; Schema: public; Owner: codrut
--

ALTER TABLE ONLY public.utilizatori
    ADD CONSTRAINT utilizatori_pkey PRIMARY KEY (id);


--
-- TOC entry 3254 (class 2606 OID 16504)
-- Name: accesari fk_user_id_accesari; Type: FK CONSTRAINT; Schema: public; Owner: codrut
--

ALTER TABLE ONLY public.accesari
    ADD CONSTRAINT fk_user_id_accesari FOREIGN KEY (user_id) REFERENCES public.utilizatori(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2024-06-03 12:58:15 EEST

--
-- PostgreSQL database dump complete
--

