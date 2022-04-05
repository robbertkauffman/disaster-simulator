pkill -f python3
nohup python3 backend_with_NO_retry.py &
nohup python3 backend_with_retry_reads.py &
nohup python3 backend_with_retry_reads_writes.py &
nohup python3 backend_with_retry_writes.py &