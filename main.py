from flask import escape, jsonify
from collections import defaultdict
import requests
import re
from google.cloud import firestore
import json
from google.cloud import pubsub_v1
import random
from datetime import datetime
from concurrent.futures import TimeoutError


def sentence_length(request):
    alphabets = "([A-Za-z])"
    prefixes = "(Mr|St|Mrs|Ms|Dr)[.]"
    suffixes = "(Inc|Ltd|Jr|Sr|Co)"
    starters = "(Mr|Mrs|Ms|Dr|He\s|She\s|It\s|They\s|Their\s|Our\s|We\s|But\s|However\s|That\s|This\s|Wherever)"
    acronyms = "([A-Z][.][A-Z][.](?:[A-Z][.])?)"
    websites = "[.](com|net|org|io|gov)"

    def split_into_sentences(text):
        text = " " + text + "  "
        text = text.replace("\n", " ")
        text = re.sub(prefixes, "\\1<prd>", text)
        text = re.sub(websites, "<prd>\\1", text)
        if "Ph.D" in text:
            text = text.replace("Ph.D.", "Ph<prd>D<prd>")
        text = re.sub("\s" + alphabets + "[.] ", " \\1<prd> ", text)
        text = re.sub(acronyms+" "+starters, "\\1<stop> \\2", text)
        text = re.sub(alphabets + "[.]" + alphabets + "[.]" +
                      alphabets + "[.]", "\\1<prd>\\2<prd>\\3<prd>", text)
        text = re.sub(alphabets + "[.]" + alphabets +
                      "[.]", "\\1<prd>\\2<prd>", text)
        text = re.sub(" "+suffixes+"[.] "+starters, " \\1<stop> \\2", text)
        text = re.sub(" "+suffixes+"[.]", " \\1<prd>", text)
        text = re.sub(" " + alphabets + "[.]", " \\1<prd>", text)
        if "”" in text:
            text = text.replace(".”", "”.")
        if "\"" in text:
            text = text.replace(".\"", "\".")
        if "!" in text:
            text = text.replace("!\"", "\"!")
        if "?" in text:
            text = text.replace("?\"", "\"?")
        text = text.replace(".", ".<stop>")
        text = text.replace("?", "?<stop>")
        text = text.replace("!", "!<stop>")
        text = text.replace("<prd>", ".")
        sentences = text.split("<stop>")
        sentences = sentences[:-1]
        sentences = [s.strip() for s in sentences]
        return sentences

    request_json = request.get_json(silent=True)
    if request_json and 'url' in request_json:
        url = request_json['url']
    else:
        url = 'http://www.gutenberg.org/files/1342/1342-0.txt'
    resp = requests.get(url)
    text = resp.text
    sentences = split_into_sentences(text)
    length_frequency = defaultdict(int)
    for i in range(0, 60):
        length_frequency[i] = 0
    for sentence in sentences:
        words = re.findall(r'\w+', sentence)
        l = len(words)
        if l < 60:
            length_frequency[l] += 1

    response = jsonify({
        'frequency': length_frequency
    })
    response.headers.add('Access-Control-Allow-Headers',
                         "Content-Type,Authorization,true")
    response.headers.add('Access-Control-Allow-Methods',
                         'GET,PUT,POST,PATCH,DELETE,OPTIONS')
    response.headers["Access-Control-Allow-Origin"] = "*"
    db = firestore.Client()
    book_id = url.split('/')[-2]
    doc_ref = db.collection(u'books').document(book_id)
    doc_ref.set({
        u'frequency': json.dumps(length_frequency)
    })
    return response


def cached_data(request):
    request_json = request.get_json(silent=True)
    if request_json and 'url' in request_json:
        url = request_json['url']
    else:
        url = 'http://www.gutenberg.org/files/1342/1342-0.txt'
    book_id = url.split('/')[-2]
    db = firestore.Client()
    doc_ref = db.collection(u'books').document(book_id)
    doc = doc_ref.get()
    if doc.exists:
        freq = json.loads(doc.to_dict()['frequency'])
        response = jsonify({
            'success': True,
            'frequency': freq,
        })
    else:
        response = jsonify({
            'success': False
        })

    response.headers.add('Access-Control-Allow-Headers',
                         "Content-Type,Authorization,true")
    response.headers.add('Access-Control-Allow-Methods',
                         'GET,PUT,POST,PATCH,DELETE,OPTIONS')
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


def publish_message(request):
    project_id = "rishabh-gajra"
    topic_id = "messages"
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(project_id, topic_id)
    msgs = [
        {
            "id": "12345",
            "channel": "chatter",
            "author": "alice",
            "message": "Who's up for lunch right now?",
            "timestamp": "2019-02-26 11:00:00",
            "matching_terms": [
                "alice",
                "chatter",
                "lunch"
            ]
        },
        {
            "id": "12346",
            "channel": "chatter",
            "author": "bob",
            "message": "I am up for lunch!",
            "timestamp": "2019-02-26 11:00:01",
            "matching_terms": [
                "bob",
                "chatter",
                "lunch"
            ]
        },
        {
            "id": "12347",
            "channel": "chatter",
            "author": "carol",
            "message": "Me too @alice!",
            "timestamp": "2019-02-26 11:00:02",
            "matching_terms": [
                "carol",
                "chatter",
                "alice"
            ]
        },
        {
            "id": "22345",
            "channel": "customer-chatter",
            "author": "alice",
            "message": "Did any of you meet with Acme folks last week?",
            "timestamp": "2019-02-26 12:00:00",
            "matching_terms": [
                "alice",
                "customer-chatter",
                "acme"
            ]
        },
        {
            "id": "22346",
            "channel": "customer-chatter",
            "author": "dave",
            "message": "Yeah, I met with Bob there",
            "timestamp": "2019-02-26 12:00:01",
            "matching_terms": [
                "dave",
                "customer-chatter",
                "bob"
            ]
        },
        {
            "id": "22347",
            "channel": "customer-chatter",
            "author": "dave",
            "message": "I think John from Acme was in that meeting too",
            "timestamp": "2019-02-26 12:00:02",
            "matching_terms": [
                "dave",
                "john",
                "acme"
            ]
        }
    ]
    data = {'id': random.randint(0, 111119),
            'channel': msgs[random.randint(0, len(msgs)-1)]['channel'],
            'author': msgs[random.randint(0, len(msgs)-1)]['author'],
            'message': msgs[random.randint(0, len(msgs)-1)]['message'],
            'matching_terms': msgs[random.randint(0, len(msgs)-1)]['matching_terms'],
            'timestamp': msgs[random.randint(0, len(msgs)-1)]['timestamp'],
            }
    data = json.dumps(data)
    data = data.encode("utf-8")
    future = publisher.publish(topic_path, data)
    print(future.result())
    response = jsonify({
        'success': True
    })
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


def get_message(request):
    subscriber = pubsub_v1.SubscriberClient()

    project_id = "rishabh-gajra"
    topic_id = "messages"
    timeout = 15.0
    subscription_id = "sub"
    subscription_path = subscriber.subscription_path(
        project_id, subscription_id)

    res = subscriber.pull(
        request={
            "subscription": subscription_path,
            "max_messages": 1,
        }
    )

    for msg in res.received_messages:
        print("Received message:", msg.message.data)
        value = msg.message.data

    ack_ids = [msg.ack_id for msg in res.received_messages]
    subscriber.acknowledge(
        request={
            "subscription": subscription_path,
            "ack_ids": ack_ids,
        }
    )
    response = jsonify({
        'success': True,
        "value": json.loads(value.decode('utf-8'))
    })
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


def store_jsons(request):

    response = jsonify({
        'success': True
    })
    slack = {
        "slack": [
            {
                "id": "12345",
                "channel": "chatter",
                "author": "alice",
                "message": "Who's up for lunch right now?",
                "timestamp": "2019-02-26 11:00:00",
                "matching_terms": [
                    "alice",
                    "chatter",
                    "lunch"
                ]
            },
            {
                "id": "12346",
                "channel": "chatter",
                "author": "bob",
                "message": "I am up for lunch!",
                "timestamp": "2019-02-26 11:00:01",
                "matching_terms": [
                    "bob",
                    "chatter",
                    "lunch"
                ]
            },
            {
                "id": "12347",
                "channel": "chatter",
                "author": "carol",
                "message": "Me too @alice!",
                "timestamp": "2019-02-26 11:00:02",
                "matching_terms": [
                    "carol",
                    "chatter",
                    "alice"
                ]
            },
            {
                "id": "22345",
                "channel": "customer-chatter",
                "author": "alice",
                "message": "Did any of you meet with Acme folks last week?",
                "timestamp": "2019-02-26 12:00:00",
                "matching_terms": [
                    "alice",
                    "customer-chatter",
                    "acme"
                ]
            },
            {
                "id": "22346",
                "channel": "customer-chatter",
                "author": "dave",
                "message": "Yeah, I met with Bob there",
                "timestamp": "2019-02-26 12:00:01",
                "matching_terms": [
                    "dave",
                    "customer-chatter",
                    "bob"
                ]
            },
            {
                "id": "22347",
                "channel": "customer-chatter",
                "author": "dave",
                "message": "I think John from Acme was in that meeting too",
                "timestamp": "2019-02-26 12:00:02",
                "matching_terms": [
                    "dave",
                    "john",
                    "acme"
                ]
            }
        ]
    }
    tweet = {
        "tweet": [
            {
                "user": "@acmecorp",
                "message": "We're hiring in Boston!",
                "timestamp": "2019-02-29",
                "matching_terms": [
                    "acme",
                    "hiring",
                    "boston"
                ]
            },
            {
                "user": "@acmecorp",
                "message": "We're no longer hiring in Timbuktu",
                "timestamp": "2019-02-27",
                "matching_terms": [
                    "acme",
                    "hiring",
                    "timbuktu"
                ]
            }
        ]
    }
    contacts = {
        "contacts": [
            {
                "id": "12345",
                "name": "John Doe",
                "company": "Acme Inc",
                "emails": [
                    "john@acme.co",
                    "doe@gmail.com"
                ],
                "phones": [
                    "650-555-5555",
                    "+44 171 5555 5555"
                ],
                "matching_terms": ["acme", "john", "john doe"],
                "last_contact": "2019-02-26"
            },
            {
                "id": "31456",
                "name": "Robert Roe",
                "company": "Acme Inc",
                "emails": [
                    "bob@acme.co"
                ],
                "phones": [
                    "+44 171 6666 5555"
                ],
                "matching_terms": ["acme", "robert", "roe", "bob"],
                "last_contact": "2019-02-29"
            },
            {
                "id": "787661",
                "name": "Alice Smith",
                "company": "Other Corp",
                "emails": [
                    "alice@other.co"
                ],
                "phones": [
                    "+1 415 555 6666"
                ],
                "matching_terms": ["alice", "other", "alice smith"],
                "last_contact": "2019-02-29"
            }
        ]
    }
    dropbox = {
        "dropbox": [
            {
                "id": "12345",
                "path": "/taxes/2016/w2-acme.pdf",
                "title": "\"2016 W2\"",
                "shared_with": [
                    "jane@accountants.com",
                    "spouse@family.org"
                ],
                "matching_terms": [
                    "tax",
                    "w2",
                    "alice"
                ],
                "created": "2016-02-01"
            },
            {
                "id": "34567",
                "path": "/work/customers/acme/invoice.docx",
                "title": "\"ACME Corp: Invoice\"",
                "shared_with": [
                    "acme-accounts@mycompany.com"
                ],
                "matching_terms": [
                    "acme",
                    "invoice"
                ],
                "created": "2019-02-01"
            },
            {
                "id": "56789",
                "path": "/purchases/2016/fridge.pdf",
                "title": "\"Best Buy: Invoice\"",
                "matching_terms": [
                    "invoice"
                ],
                "created": "2019-02-01"
            },
            {
                "id": "3456789",
                "path": "/work/customers/acme/proposal.docx",
                "title": "\"ACME Corp: Draft MoU\"",
                "shared_with": [
                    "acme-accounts@mycompany.com"
                ],
                "matching_terms": [
                    "acme",
                    "proposal",
                    "mou"
                ],
                "created": "2019-01-19"
            },
            {
                "id": "3556789",
                "path": "/work/customers/acme/meeting-notes.docx",
                "title": "\"ACME Corp: Meeting Notes\"",
                "shared_with": [
                    "acme-accounts@mycompany.com"
                ],
                "matching_terms": [
                    "acme",
                    "meeting notes"
                ],
                "created": "2019-02-04"
            }
        ]
    }
    calendar = {
        "calendar": [
            {
                "id": "12345",
                "title": "Acme Proposal Meeting",
                "invitees": "dave, john, bob, carol",
                "matching_terms": [
                    "dave",
                    "john",
                    "bob",
                    "carol",
                    "acme"
                ],
                "date": "2019-01-10 10:00:00"
            },
            {
                "id": "12345",
                "title": "Acme Final Delivery Meeting",
                "invitees": "dave, john, bob, alice",
                "matching_terms": [
                    "dave",
                    "john",
                    "bob",
                    "alice",
                    "acme"
                ],
                "date": "2019-03-01 11:00:00"
            }
        ]
    }
    db = firestore.Client()
    doc_ref = db.collection(u'books').document(u"jsons")
    response.headers["Access-Control-Allow-Origin"] = "*"
    doc_ref.set({
        u'slack': json.dumps(slack),
        u'dropbox': json.dumps(dropbox),
        u'contacts': json.dumps(contacts),
        u'tweet': json.dumps(tweet),
        u'calendar': json.dumps(calendar),

    })
    return response


def dashbaord_data(request):
    db = firestore.Client()
    doc_ref = db.collection(u'books').document('jsons')
    doc = doc_ref.get()
    if doc.exists:
        slack = json.loads(doc.to_dict()['slack'])
        dropbox = json.loads(doc.to_dict()['dropbox'])
        contacts = json.loads(doc.to_dict()['contacts'])
        tweet = json.loads(doc.to_dict()['tweet'])
        calendar = json.loads(doc.to_dict()['calendar'])
        response = jsonify({
            'success': True,
            'slack': slack,
            u'dropbox': dropbox,
            u'contacts': contacts,
            u'tweet': tweet,
            u'calendar': calendar,
        })
    else:
        response = jsonify({
            'success': False
        })
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response
