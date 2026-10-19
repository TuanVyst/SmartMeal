class User {
  final String? accountId;
  final String? username;
  final String? email;
  final String? name;
  final String? phone;
  final String? avatarUrl;
  final String? role;
  final String? token;
  final String? address;

  User({
    this.accountId,
    this.username,
    this.email,
    this.name,
    this.phone,
    this.avatarUrl,
    this.role,
    this.token,
    this.address,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      accountId: json['accountId']?.toString() ??
          json['account_id']?.toString() ??
          json['Account_id']?.toString() ??
          json['id']?.toString() ??
          json['Id']?.toString(),
      username: (json['username'] ?? json['Username']) as String?,
      email: (json['email'] ?? json['Email']) as String?,
      name: (json['name'] ?? json['Name']) as String?,
      phone: (json['phone'] ?? json['Phone']) as String?,
      avatarUrl: (json['avatarUrl'] ?? json['AvatarUrl'] ?? json['avatar'] ?? json['Avatar']) as String?,
      role: (json['role'] ?? json['Role'])?.toString(),
      token: (json['token'] ?? json['Token']) as String?,
      address: (json['address'] ?? json['Address']) as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accountId': accountId,
      'username': username,
      'email': email,
      'name': name,
      'phone': phone,
      'avatarUrl': avatarUrl,
      'role': role,
      'token': token,
      'address': address,
    };
  }

  bool get isAdmin => role == 'Admin';

  String get displayName => name ?? username ?? 'Bạn';

  String get initials => displayName.isNotEmpty ? displayName[0].toUpperCase() : '?';

  String? get avatar => avatarUrl;

  User copyWith({
    String? accountId,
    String? username,
    String? email,
    String? name,
    String? phone,
    String? avatarUrl,
    String? role,
    String? token,
    String? address,
  }) {
    return User(
      accountId: accountId ?? this.accountId,
      username: username ?? this.username,
      email: email ?? this.email,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      role: role ?? this.role,
      token: token ?? this.token,
      address: address ?? this.address,
    );
  }
}
