# Cloud Free for all assignment report

In this assignment, I have designed a Dashboard front end in React JS that is served by a serverless backend. The serverless backend uses Fire store for data storage. 
Url: http://35.224.210.143/
What all i have implemented:
FaaS implementation
Front end React JS
Firebase DB
Google Pub/Sub Message broker service
Google Cloud Scheduler

## FaaS implementation
### Design
![image](https://user-images.githubusercontent.com/25266353/101973298-0a492180-3c05-11eb-8ba8-af92b7f79c8d.png)
VM instance:
![image](https://user-images.githubusercontent.com/25266353/101973406-d7ebf400-3c05-11eb-805b-1737e5f4bae7.png)
Gcloud functions:
![image](https://user-images.githubusercontent.com/25266353/101973420-fd78fd80-3c05-11eb-88ff-107406a6a447.png)

The functionality to check for cached data graphs and creating new graphs was seperated into two seperate functions to maintain modularity.
### The flow
 - The UI is written in React JS. When the user goes to landing page, the see various data like their files, messages, tweets of accounts they follow, their recent contacts and meetings that are up next.
 - This data is stored in the firestore DB, for now the info is general but this is just a component to a system with proper login and signup.
 - The UI hits a function dashbaord_data which is a google cloud serverless function, this fumction responds with the data that is displayed with various components on the dashbaord.
 - There is a scheduled cron job on google cloud that triggers a google function every 15 minutes. This google cloud function writes a random message to the pub/sub setup as a message broker. This is meant to simulate a 3 party API sending messages.
 - The UI then uses a google cloud function to poll the message topic by sibscribing to it. When there is a new message available to the message topic, the google cloud function sends to message to the UI and then acknowledges it so it can be deleted and the message isnt repeated.
 - The UI without refreshing the page renders the new messages.
 - The user has the option to search vy clicking on the search button. Results are filtered dynamically as the user types. The keywords that can be searched are the fields, names of participants and type of the file. 
 - The exact matches to searched terms are highlighted in pink and the widgets that dont have any fields that match the searched term is hidden.
## Components
### UI 
![image](https://user-images.githubusercontent.com/25266353/101973542-ceaf5700-3c06-11eb-8711-9f56e32d5ca5.png)
![image](https://user-images.githubusercontent.com/25266353/101973566-ed155280-3c06-11eb-9264-d50a02f3e202.png)
The UI on load hits the following url to get the basic data
        `https://us-central1-rishabh-gajra.cloudfunctions.net/dashbaord_data`
Response:
```javascript
{
calendar: {calendar: Array(2)}
contacts: {contacts: Array(3)}
dropbox: {dropbox: Array(5)}
slack: {slack: Array(6)}
}
```
The UI has different compopents for each of the different widgets that need to be shown:
Calendar
![image](https://user-images.githubusercontent.com/25266353/101973660-9f4d1a00-3c07-11eb-83ca-475049b0b305.png)
Chat message:
![image](https://user-images.githubusercontent.com/25266353/101973671-bb50bb80-3c07-11eb-90c0-cfa6056cc40d.png)
file stores on cloud:
![image](https://user-images.githubusercontent.com/25266353/101973714-ff43c080-3c07-11eb-9750-bcddc8ebb64f.png)
Tweet:
![image](https://user-images.githubusercontent.com/25266353/101974604-46ca4c80-3c08-11eb-91ec-1240d78462f2.png)

Contacts:
![image](https://user-images.githubusercontent.com/25266353/101974249-2c906e80-3c08-11eb-9f15-d16e1b956b03.png)

Search mechanism:
![image](https://user-images.githubusercontent.com/25266353/101975296-631ab900-3c09-11eb-8e47-07b37001be20.png)
As you can see, on search of "alice" all matches where "Alice" is present is highlighted.
Loading screen while polling for new messages:
![image](https://user-images.githubusercontent.com/25266353/101975314-9fe6b000-3c09-11eb-99fe-c1fe4483ef68.png)
You can see a new message was added in the chat history here:
![image](https://user-images.githubusercontent.com/25266353/101975347-e20ff180-3c09-11eb-9ab5-cd9af2e0238e.png)

## The cron job using google cloud scheduler: 
![image](https://user-images.githubusercontent.com/25266353/101975365-1388bd00-3c0a-11eb-95b7-59bbdabe6e30.png)
Hits an http get request every 15 minutes to 
`https://us-central1-rishabh-gajra.cloudfunctions.net/publish_message`
## publish_message
This is a flask function written in python. It selects a random value to populate a json that would represent a message and writes it to a pub/sub message topic.
```python
    project_id = "rishabh-gajra"
    topic_id = "messages"
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(project_id, topic_id)
    #data = {values here}
    data = json.dumps(data)
    data = data.encode("utf-8")
    future = publisher.publish(topic_path, data)
```
example message:
![image](https://user-images.githubusercontent.com/25266353/101975468-ceb15600-3c0a-11eb-8507-87837815ace4.png)

## get_message:
`https://us-central1-rishabh-gajra.cloudfunctions.net/get_message`
This function subcribes to the topic and returns all the messages sent to the topic with the following code
```python
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
```
It responds to the UI with the messags and lets the google topic know that messages have be recevied by sending back an acknowldgement.
example response to the UI:
```javascript
{
  "success": true,
  "value": 
  {
    "author": "alice",
    "channel": "customer-chatter",
    "id": 4464,
    "matching_terms": "2019-02-26 12:00:02",
    "message": "I think John from Acme was in that meeting too"
  }
}
```
## dashbaord_data
`https://us-central1-rishabh-gajra.cloudfunctions.net/dashbaord_data`
This is a simple get request flask api that responds with the data from firestore. 
Response:
```javascript
{
calendar: {calendar: Array(2)}
contacts: {contacts: Array(3)}
dropbox: {dropbox: Array(5)}
slack: {slack: Array(6)}
}
```
code to access from fire store:
```python
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
```
## store_jsons
stores the json in to the backend / firestore DB. No front end integration for this so the users cant create new instance sof the widgets for now.
code to dump data into collections.
```python 
    db = firestore.Client()
    doc_ref = db.collection(u'books').document(u"jsons")
    doc_ref.set({
        u'slack': json.dumps(slack),
        u'dropbox': json.dumps(dropbox),
        u'contacts': json.dumps(contacts),
        u'tweet': json.dumps(tweet),
        u'calendar': json.dumps(calendar),

    })
```

command to deploy and delete gcloud functions:
```bash
gcloud functions deploy sentence_length --runtime python38 --trigger-http --allow-unauthenticated
gcloud functions delete sentence_length
```
## firestore 
This is a key value store that works on collections of documents where each document has a label as attributed. For the purpose of this assignment I created a collection called collection and stored json values for each of the fields as shown here. 
![image](https://user-images.githubusercontent.com/25266353/101975630-f6ed8480-3c0b-11eb-940d-c9eb8854d117.png)

## nginx and gcp VM
Installed ngnix on an ubuntu VM and hosted a website made by building a react website.
```bash
gcloud compute instances create %s --zone us-central1-a --machine-type=e2-micro --image=ubuntu-1804-bionic-v20201014 --image-project=ubuntu-os-cloud --boot-disk-size=10GB --scopes=compute-rw,storage-ro
```
```bash
sudo apt install nginx
sudo cp -r /build/. /var/www/html/.
 sudo service nginx restart
```


