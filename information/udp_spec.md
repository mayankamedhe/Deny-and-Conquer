# UDP spec

### Header scheme:

The header is 7 bytes long. The first 6 bytes store the unix time in milliseconds.
Next byte stores the user ID the message is from. The initial host has ID 0 and assigns other ID's to the clients as they connect.

### Clock synchcronization scheme:

Host will send a number of UDP packets (10 - 25?) to the client in a short burst, approximately 5ms - 25ms between them. When the client receives them it will respond immediately with another packet storing both the departure time from the host and from the client. The host will also time the round trip travel time for the packets. Knowing the time between the packets it sent as well as knowing the time between the packets the client sent (via their client departure timestamp) allows the host to infer the travel time from host --> client and client --> host. If this time and its variance is below a threshold (25ms?) a clock synchronization will be performed using the inferred information. If the threshold is passed, the timing step will be performed again with a new higher threshold. If this threshold is maintained, all clients will be synchronized using it as an upper bound of timing error.

The ms tick rate of the game will not be allowed to be higher than the upper bound of timing error.