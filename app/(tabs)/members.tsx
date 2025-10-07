import { Calendar, Loader2, Sparkles, Users, UsersRound } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getClassMembers } from '../../services/api';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CARD_WIDTH = (width - (CARD_MARGIN * 3)) / 2;

export default function MembersScreen() {
  const [year, setYear] = useState('2565');
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const years = ['2563', '2564', '2565', '2566', '2567'];

  useEffect(() => {
    loadMembers();
  }, [year]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      if (!token) throw new Error('No auth token');
      const gregorianYear = (() => {
        const n = parseInt(year, 10);
        return Number.isFinite(n) ? String(n - 543) : year;
      })();
      const data = await getClassMembers(gregorianYear, token);
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load members', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarGradient = (initial: string) => {
    const gradients = [
      { start: '#667eea', end: '#764ba2' },
      { start: '#f093fb', end: '#f5576c' },
      { start: '#4facfe', end: '#00f2fe' },
      { start: '#43e97b', end: '#38f9d7' },
      { start: '#fa709a', end: '#fee140' },
      { start: '#30cfd0', end: '#330867' },
      { start: '#a8edea', end: '#fed6e3' },
      { start: '#ff9a9e', end: '#fecfef' },
    ];
    const index = initial.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const MemberCard = ({ member, index }: { member: any; index: number }) => {
    const [scaleAnim] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 50,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }, []);

    const fullName = member.name || [member.firstname, member.lastname].filter(Boolean).join(' ') || member.email || 'ไม่ระบุชื่อ';
    const studentId = member.studentId || member.education?.studentId || '';
    const initial = (fullName?.charAt(0) || 'S').toUpperCase();
    const gradient = getAvatarGradient(initial);

    return (
      <Animated.View style={[
        styles.memberCard,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        }
      ]}>
        <View style={styles.cardGlow} />
        <View style={[styles.avatar, { backgroundColor: gradient.start }]}>
          <View style={[styles.avatarInner, { backgroundColor: gradient.end }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.name} numberOfLines={2}>
            {fullName}
          </Text>
          {studentId && (
            <View style={styles.idBadge}>
              <View style={styles.idDot} />
              <Text style={styles.studentId} numberOfLines={1}>
                {studentId}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundPattern} />
      
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCircle}>
              <Loader2 color="#667eea" size={40} strokeWidth={2.5} />
            </View>
            <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
            <Text style={styles.loadingSubText}>โปรดรอสักครู่</Text>
          </View>
        ) : (
          <FlatList
            data={members}
            keyExtractor={(item, index) => (item?._id || item?.id || `index-${index}`).toString()}
            renderItem={({ item, index }) => <MemberCard member={item} index={index} />}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                {/* Header with Gradient Background */}
                <View style={styles.headerGradient}>
                  <View style={styles.headerGlow} />
                  <View style={styles.header}>
                    <View style={styles.titleContainer}>
                      <View style={styles.iconWrapper}>
                        <Users color="#ffffff" size={28} strokeWidth={2.5} />
                      </View>
                      <View>
                        <Text style={styles.title}>รายชื่อสมาชิก</Text>
                        <View style={styles.titleUnderline} />
                      </View>
                    </View>
                    <Text style={styles.subtitle}>เลือกปีการศึกษาเพื่อดูรายชื่อสมาชิก</Text>
                    
                    <View style={styles.yearSelectorContainer}>
                      <View style={styles.yearLabelContainer}>
                        <View style={styles.calendarIcon}>
                          <Calendar color="#667eea" size={16} strokeWidth={2} />
                        </View>
                        <Text style={styles.yearLabel}>ปีการศึกษา</Text>
                      </View>
                      <View style={styles.yearButtonsWrapper}>
                        {years.map((y) => (
                          <TouchableOpacity
                            key={y}
                            style={[
                              styles.yearButton,
                              year === y && styles.yearButtonActive
                            ]}
                            onPress={() => setYear(y)}
                            activeOpacity={0.7}
                          >
                            <Text style={[
                              styles.yearButtonText,
                              year === y && styles.yearButtonTextActive
                            ]}>
                              {y}
                            </Text>
                            {year === y && (
                              <View style={styles.activeIndicator} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>

                {/* Stats Card */}
                {members.length > 0 && (
                  <View style={styles.statsCard}>
                    <View style={styles.statsGlow} />
                    <View style={styles.statsIconContainer}>
                      <Sparkles color="#667eea" size={24} strokeWidth={2} />
                    </View>
                    <View style={styles.statsTextContainer}>
                      <View style={styles.statsRow}>
                        <Text style={styles.statsNumber}>{members.length}</Text>
                        <Text style={styles.statsUnit}>คน</Text>
                      </View>
                      <Text style={styles.statsLabel}>สมาชิกทั้งหมด</Text>
                    </View>
                    <View style={styles.statsDecorator} />
                  </View>
                )}
              </>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <UsersRound color="#cbd5e1" size={56} strokeWidth={1.5} />
                  <View style={styles.emptyIconDot} />
                </View>
                <Text style={styles.emptyText}>ไม่พบข้อมูลสมาชิก</Text>
                <Text style={styles.emptySubText}>
                  ลองเลือกปีการศึกษาอื่นดู
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    backgroundColor: '#667eea',
    opacity: 0.03,
  },
  content: {
    flex: 1,
  },
  headerGradient: {
    backgroundColor: '#667eea',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: -30,
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  titleUnderline: {
    height: 3,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  yearSelectorContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  yearLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  calendarIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  yearButtonsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  yearButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    minWidth: 70,
    alignItems: 'center',
    position: 'relative',
  },
  yearButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  yearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  yearButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 24,
    marginTop: 44,
    marginHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f4ff',
    overflow: 'hidden',
    position: 'relative',
  },
  statsGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#667eea',
    opacity: 0.05,
  },
  statsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e0e7ff',
  },
  statsTextContainer: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#667eea',
    lineHeight: 36,
  },
  statsUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  statsLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  statsDecorator: {
    position: 'absolute',
    bottom: -10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    opacity: 0.05,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#f0f4ff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
  },
  loadingSubText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 6,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: CARD_MARGIN,
    paddingHorizontal: 16,
  },
  memberCard: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    opacity: 0.04,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    padding: 3,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 39,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  memberInfo: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20,
  },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e0e7ff',
    gap: 6,
  },
  idDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#667eea',
  },
  studentId: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyIconContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 3,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    position: 'relative',
  },
  emptyIconDot: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f0f4ff',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  emptyText: {
    fontSize: 20,
    color: '#475569',
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '500',
  },
});