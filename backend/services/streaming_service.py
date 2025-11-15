import json
from datetime import datetime
from typing import Dict, Any
from config.settings import settings

# Note: In production, install kafka-python or boto3 for AWS Kinesis
# pip install kafka-python
# from kafka import KafkaProducer

class StreamingService:
    """Minimal streaming stub; replace with real brokers in production."""
    
    def __init__(self):
        # In production:
        # self.producer = KafkaProducer(
        #     bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
        #     value_serializer=lambda v: json.dumps(v).encode('utf-8')
        # )
        self.enabled = False  # Set to True when Kafka/Kinesis is configured
    
    def publish_event(self, topic: str, event_data: Dict[str, Any]):
        """Publish an event to the configured streaming backend."""
        if not self.enabled:
            # Log event for development/testing
            print(f"[STREAM] Topic: {topic}")
            print(f"[STREAM] Event: {json.dumps(event_data, indent=2, default=str)}")
            return
        
        # In production with Kafka:
        # self.producer.send(topic, value=event_data)
        # self.producer.flush()
        
        # In production with AWS Kinesis:
        # import boto3
        # kinesis = boto3.client('kinesis')
        # kinesis.put_record(
        #     StreamName=topic,
        #     Data=json.dumps(event_data),
        #     PartitionKey=str(event_data.get('user_id', 'default'))
        # )
        pass


# Global streaming service instance
streaming_service = StreamingService()


def publish_transaction_event(
    event_type: str,
    transaction_id: int,
    user_id: int,
    data: Dict[str, Any]
):
    """Publish a transaction event to the streaming pipeline."""
    event = {
        "event_type": event_type,
        "transaction_id": transaction_id,
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat(),
        "data": data
    }
    
    streaming_service.publish_event(
        topic=settings.KAFKA_TOPIC_TRANSACTIONS,
        event_data=event
    )


def publish_notification_event(
    event_type: str,
    user_id: int,
    notification_data: Dict[str, Any]
):
    """Publish a notification event to the streaming pipeline."""
    event = {
        "event_type": event_type,
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat(),
        "data": notification_data
    }
    
    streaming_service.publish_event(
        topic=settings.KAFKA_TOPIC_NOTIFICATIONS,
        event_data=event
    )
