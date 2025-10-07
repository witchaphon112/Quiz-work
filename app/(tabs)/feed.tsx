import AsyncStorage from '@react-native-async-storage/async-storage';
import { Edit3, Heart, MessageCircle, Send, Sparkles, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

type Comment = {
  id: string;
  userName: string;
  text: string;
  createdAt: number;
};

type Post = {
  id: string;
  authorName: string;
  content: string;
  createdAt: number;
  likes: string[];
  comments: Comment[];
};

const STORAGE_KEY = 'local_feed_posts_v1';

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    '#667eea', '#f093fb', '#4facfe', '#43e97b',
    '#fa709a', '#30cfd0', '#a8edea', '#ff9a9e'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const formatTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'เมื่อสักครู่';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  if (days < 7) return `${days} วันที่แล้ว`;
  return new Date(timestamp).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
};

const LikeButton = ({ postId, youLiked, count, onPress }: { 
  postId: string; 
  youLiked: boolean; 
  count: number;
  onPress: (postId: string) => void;
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.3, useNativeDriver: true, tension: 100, friction: 3 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 3 }),
    ]).start();
    onPress(postId);
  };

  return (
    <TouchableOpacity 
      style={[styles.actionButton, youLiked && styles.actionButtonActive]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Heart 
          color={youLiked ? '#ef4444' : '#64748b'} 
          size={18} 
          strokeWidth={2.5}
          fill={youLiked ? '#ef4444' : 'none'}
        />
      </Animated.View>
      <Text style={[styles.actionText, youLiked && styles.actionTextActive]}>
        {count > 0 ? count : 'ถูกใจ'}
      </Text>
    </TouchableOpacity>
  );
};

const PostCard = ({ 
  item, 
  index,
  userId,
  commentDraft,
  isExpanded,
  onToggleLike,
  onToggleComments,
  onCommentChange,
  onAddComment,
}: {
  item: Post;
  index: number;
  userId?: string;
  commentDraft: string;
  isExpanded: boolean;
  onToggleLike: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onCommentChange: (postId: string, text: string) => void;
  onAddComment: (postId: string) => void;
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const youLiked = userId ? item.likes.includes(userId) : false;
  const avatarColor = getAvatarColor(item.authorName);
  const initials = getInitials(item.authorName);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.post, { opacity: fadeAnim }]}>
      <View style={styles.postGlow} />
      
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{item.authorName}</Text>
          <Text style={styles.postTime}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.postContent}>{item.content}</Text>

      {/* Actions */}
      <View style={styles.actions}>
        <LikeButton 
          postId={item.id} 
          youLiked={youLiked} 
          count={item.likes.length}
          onPress={onToggleLike}
        />
        
        <TouchableOpacity 
          style={[styles.actionButton, isExpanded && styles.actionButtonActive]}
          onPress={() => onToggleComments(item.id)}
          activeOpacity={0.7}
        >
          <MessageCircle 
            color={isExpanded ? '#667eea' : '#64748b'} 
            size={18} 
            strokeWidth={2.5}
          />
          <Text style={[styles.actionText, isExpanded && styles.actionTextActive]}>
            {item.comments.length > 0 ? item.comments.length : 'แสดงความคิดเห็น'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comments Section */}
      {isExpanded && (
        <View style={styles.commentsSection}>
          <View style={styles.commentsDivider} />
          
          {item.comments.length > 0 ? (
            <View style={styles.commentsList}>
              {item.comments.map((c) => {
                const commentColor = getAvatarColor(c.userName);
                const commentInitials = getInitials(c.userName);
                
                return (
                  <View key={c.id} style={styles.commentRow}>
                    <View style={[styles.commentAvatar, { backgroundColor: commentColor }]}>
                      <Text style={styles.commentAvatarText}>{commentInitials}</Text>
                    </View>
                    <View style={styles.commentBubble}>
                      <Text style={styles.commentAuthor}>{c.userName}</Text>
                      <Text style={styles.commentText}>{c.text}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyComments}>
              <MessageCircle color="#cbd5e1" size={32} strokeWidth={1.5} />
              <Text style={styles.emptyCommentsText}>ยังไม่มีความคิดเห็น</Text>
            </View>
          )}

          {/* Comment Input */}
          <View style={styles.commentInputRow}>
            <View style={[styles.commentInputAvatar, { backgroundColor: userId ? getAvatarColor(item.authorName) : '#94a3b8' }]}>
              <Text style={styles.commentInputAvatarText}>
                {userId ? getInitials(item.authorName) : '?'}
              </Text>
            </View>
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="เขียนความคิดเห็น..."
                placeholderTextColor="#94a3b8"
                value={commentDraft}
                onChangeText={(t) => onCommentChange(item.id, t)}
                multiline
              />
              <TouchableOpacity 
                style={styles.commentSendButton} 
                onPress={() => onAddComment(item.id)}
                activeOpacity={0.7}
              >
                <Send color="#ffffff" size={16} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

export default function FeedScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setPosts(JSON.parse(raw));
      } catch {}
    };
    load();
  }, []);

  const persist = async (next: Post[]) => {
    setPosts(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const addPost = async () => {
    const content = newPost.trim();
    if (!content || !user) return;
    const post: Post = {
      id: `${Date.now()}`,
      authorName: `${user.firstname} ${user.lastname}`,
      content,
      createdAt: Date.now(),
      likes: [],
      comments: [],
    };
    setNewPost('');
    await persist([post, ...posts]);
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;
    const uid = user._id;
    const next = posts.map((p) => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(uid);
      return { ...p, likes: liked ? p.likes.filter((x) => x !== uid) : [...p.likes, uid] };
    });
    await persist(next);
  };

  const addComment = async (postId: string) => {
    if (!user) return;
    const text = (commentDrafts[postId] || '').trim();
    if (!text) return;
    const next = posts.map((p) => {
      if (p.id !== postId) return p;
      const c: Comment = {
        id: `${Date.now()}`,
        userName: `${user.firstname} ${user.lastname}`,
        text,
        createdAt: Date.now(),
      };
      return { ...p, comments: [...p.comments, c] };
    });
    setCommentDrafts({ ...commentDrafts, [postId]: '' });
    await persist(next);
  };

  const toggleComments = (postId: string) => {
    setExpandedComments({ ...expandedComments, [postId]: !expandedComments[postId] });
  };

  const handleCommentChange = (postId: string, text: string) => {
    setCommentDrafts({ ...commentDrafts, [postId]: text });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        {/* Posts List */}
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <PostCard
              item={item}
              index={index}
              userId={user?._id}
              commentDraft={commentDrafts[item.id] || ''}
              isExpanded={expandedComments[item.id] || false}
              onToggleLike={toggleLike}
              onToggleComments={toggleComments}
              onCommentChange={handleCommentChange}
              onAddComment={addComment}
            />
          )}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerGlow} />
                <View style={styles.headerContent}>
                  <View style={styles.headerIcon}>
                    <Sparkles color="#667eea" size={24} strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>ฟีด</Text>
                    <Text style={styles.headerSubtitle}>แบ่งปันความคิดของคุณ</Text>
                  </View>
                </View>
              </View>

              {/* New Post */}
              <View style={styles.newPostContainer}>
                <View style={styles.newPostGlow} />
                <View style={styles.newPostHeader}>
                  <Edit3 color="#667eea" size={18} strokeWidth={2.5} />
                  <Text style={styles.newPostLabel}>สร้างโพสต์ใหม่</Text>
                </View>
                <TextInput
                  style={styles.newPostInput}
                  placeholder="คุณกำลังคิดอะไรอยู่?"
                  placeholderTextColor="#94a3b8"
                  multiline
                  value={newPost}
                  onChangeText={setNewPost}
                />
                <TouchableOpacity 
                  style={[styles.postButton, !newPost.trim() && styles.postButtonDisabled]} 
                  onPress={addPost}
                  disabled={!newPost.trim()}
                  activeOpacity={0.8}
                >
                  <TrendingUp color="#ffffff" size={18} strokeWidth={2.5} />
                  <Text style={styles.postButtonText}>โพสต์</Text>
                </TouchableOpacity>
              </View>
            </>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Sparkles color="#cbd5e1" size={48} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>ยังไม่มีโพสต์</Text>
              <Text style={styles.emptySubtitle}>เริ่มต้นแบ่งปันความคิดของคุณกันเลย!</Text>
            </View>
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    position: 'relative',
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#667eea',
    opacity: 0.05,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e7ff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  newPostContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
    overflow: 'hidden',
  },
  newPostGlow: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#667eea',
    opacity: 0.03,
  },
  newPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  newPostLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  newPostInput: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    minHeight: 80,
    fontSize: 15,
    color: '#1e293b',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#667eea',
    alignSelf: 'flex-end',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  postButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
  },
  postButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 32,
  },
  post: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
    overflow: 'hidden',
  },
  postGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#667eea',
    opacity: 0.03,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  postContent: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  actionButtonActive: {
    backgroundColor: '#f0f4ff',
    borderColor: '#e0e7ff',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  actionTextActive: {
    color: '#667eea',
  },
  commentsSection: {
    marginTop: 16,
  },
  commentsDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 16,
  },
  commentsList: {
    gap: 12,
    marginBottom: 16,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  commentBubble: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyCommentsText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  commentInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  commentInputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  commentInputAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  commentInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingLeft: 16,
    paddingVertical: 4,
    paddingRight: 4,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    maxHeight: 80,
    paddingVertical: 8,
  },
  commentSendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '500',
  },
});